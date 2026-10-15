"""Yoco online payments: server-side only.

Secret keys never leave the server. Callers pass the decrypted key in, use it for one request, and never log it.
Webhooks follow the Standard Webhooks scheme that Yoco documents: webhook-id, webhook-timestamp and
webhook-signature headers, HMAC-SHA256 over "{id}.{timestamp}.{raw body}", keyed by the base64 part of a whsec_ secret.
"""
import base64
import hashlib
import hmac
import re
import time

import httpx

BASE_URL = 'https://payments.yoco.com/api'
TOLERANCE_SECONDS = 300
SECRET_KEY_PATTERN = re.compile(r'sk_(test|live)_[A-Za-z0-9]{8,200}')
PUBLIC_KEY_PATTERN = re.compile(r'pk_(test|live)_[A-Za-z0-9]{8,200}')
WEBHOOK_SECRET_PATTERN = re.compile(r'whsec_[A-Za-z0-9+/=]{16,200}')
PAID_STATUSES = {'completed', 'succeeded', 'paid'}


class YocoError(Exception):
    """A safe, user-readable failure. Never contains keys or raw provider responses."""


class WebhookError(Exception):
    pass


def key_mode(secret):
    match = SECRET_KEY_PATTERN.fullmatch(secret or '')
    return match.group(1) if match else None


def _client(transport=None):
    return httpx.Client(base_url=BASE_URL, timeout=10, transport=transport)


def create_checkout(secret, amount_cents, currency, success_url, cancel_url, failure_url, metadata, idempotency_key, transport=None):
    body = {
        'amount': int(amount_cents),
        'currency': currency,
        'successUrl': success_url,
        'cancelUrl': cancel_url,
        'failureUrl': failure_url,
        'metadata': metadata,
    }
    headers = {'Authorization': f'Bearer {secret}', 'Idempotency-Key': idempotency_key}
    try:
        with _client(transport) as client:
            response = client.post('/checkouts', json=body, headers=headers)
    except httpx.HTTPError as exc:
        raise YocoError('Could not reach Yoco right now. Please try again shortly.') from exc
    if response.status_code >= 400:
        raise YocoError(f'Yoco did not accept the payment request ({response.status_code}).')
    data = response.json()
    if not data.get('id') or not data.get('redirectUrl'):
        raise YocoError('Yoco returned an incomplete checkout.')
    return {'id': str(data['id']), 'redirectUrl': str(data['redirectUrl'])}


def fetch_checkout(secret, checkout_id, transport=None):
    """Ask Yoco directly for the checkout status, so we never trust a webhook body on its own."""
    try:
        with _client(transport) as client:
            response = client.get(f'/checkouts/{checkout_id}', headers={'Authorization': f'Bearer {secret}'})
    except httpx.HTTPError as exc:
        raise YocoError('Could not confirm the payment with Yoco.') from exc
    if response.status_code >= 400:
        raise YocoError(f'Yoco could not confirm the checkout ({response.status_code}).')
    return response.json()


def is_paid(checkout, expected_cents):
    status = str(checkout.get('status', '')).lower()
    amount = checkout.get('amountInCents', checkout.get('amount'))
    return status in PAID_STATUSES and (amount is None or int(amount) == int(expected_cents))


def verify_webhook(secret, headers, body, now=None):
    """Raise WebhookError unless the delivery is signed with this endpoint's secret and is recent."""
    message_id = headers.get('webhook-id', '')
    timestamp = headers.get('webhook-timestamp', '')
    signatures = headers.get('webhook-signature', '')
    if not message_id or not timestamp or not signatures:
        raise WebhookError('Missing signature headers.')
    try:
        sent = int(timestamp)
    except ValueError as exc:
        raise WebhookError('Bad timestamp.') from exc
    now = int(time.time()) if now is None else now
    if abs(now - sent) > TOLERANCE_SECONDS:
        raise WebhookError('Timestamp outside the allowed window.')
    if not secret or not secret.startswith('whsec_'):
        raise WebhookError('No webhook secret configured.')
    try:
        key = base64.b64decode(secret[len('whsec_'):])
    except ValueError as exc:
        raise WebhookError('Webhook secret is malformed.') from exc
    signed = f'{message_id}.{timestamp}.'.encode() + body
    expected = base64.b64encode(hmac.new(key, signed, hashlib.sha256).digest()).decode()
    candidates = [part.split(',', 1)[1] for part in signatures.split() if part.startswith('v1,') and ',' in part]
    if not any(hmac.compare_digest(expected, candidate) for candidate in candidates):
        raise WebhookError('Signature does not match.')
