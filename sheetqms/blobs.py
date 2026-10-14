from __future__ import annotations
from pathlib import Path
from contextlib import contextmanager
import os
import tempfile


class LocalBlobs:
    """Development adapter only; never selected in production."""
    mode = 'development filesystem'
    def __init__(self, root):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
    def _path(self, key):
        parts = Path(key).parts
        if not parts or any(p in {'..', '.'} for p in parts) or key.startswith('/'):
            raise ValueError('Invalid object key.')
        return self.root / key
    def put(self, key, data):
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        path.write_bytes(data)
    def get(self, key):
        return self._path(key).read_bytes()
    def delete(self, key):
        self._path(key).unlink(missing_ok=True)


class R2Blobs:
    mode = 'private R2 object storage'
    def __init__(self):
        import boto3
        from botocore.config import Config
        self.bucket = os.environ['SHEETQMS_R2_BUCKET']
        endpoint = os.environ['SHEETQMS_R2_ENDPOINT']
        if not endpoint.startswith('https://') or not endpoint.endswith('.r2.cloudflarestorage.com'):
            raise ValueError('Use the approved HTTPS R2 endpoint.')
        self.client = boto3.client('s3', endpoint_url=endpoint, aws_access_key_id=os.environ['SHEETQMS_R2_ACCESS_KEY'], aws_secret_access_key=os.environ['SHEETQMS_R2_SECRET_KEY'], region_name='auto', config=Config(signature_version='s3v4', retries={'max_attempts': 0}, connect_timeout=10, read_timeout=30))
    def put(self, key, data):
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data, ContentType='application/octet-stream')
    def get(self, key):
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        if response['ContentLength'] > 80 * 1024 * 1024:
            raise ValueError('Object exceeds the guarded download size.')
        with response['Body'] as stream:
            return stream.read()
    def delete(self, key):
        self.client.delete_object(Bucket=self.bucket, Key=key)


@contextmanager
def materialise(job, blobs):
    """Every request hydrates its own scratch files; no serverless-local persistence."""
    import copy
    with tempfile.TemporaryDirectory(prefix='sheetqms-') as directory:
        work = copy.deepcopy(job)
        for file in [work['files']['template']] + work['files']['sources']:
            path = Path(directory) / (file['id'] + file['extension'])
            path.write_bytes(blobs.get(file['object_key']))
            file['path'] = str(path)
        yield work, Path(directory) / 'output.xlsx'
