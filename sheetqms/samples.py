from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation

BLUE = '3559E0'


def style_sheet(ws, header_row, width=19):
    for cell in ws[header_row]:
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor=BLUE)
        cell.alignment = Alignment(vertical='center')
        ws.column_dimensions[cell.column_letter].width = width
    ws.row_dimensions[header_row].height = 26
    ws.freeze_panes = f'A{header_row + 1}'


def target(path: Path, mode='pivot'):
    wb = Workbook()
    ws = wb.active
    ws.title = 'Output'
    headers = ['Site', 'Jan', 'Feb', 'Mar', 'Total'] if mode == 'pivot' else ['Site', 'Period', 'Units']
    if mode == 'direct':
        headers = ['Item', 'Description', 'Qty']
    ws.append(['SYNTHETIC TEMPLATE — not a client workbook'])
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
    ws['A1'].font = Font(size=14, bold=True, color='23334B')
    ws.append([])
    ws.append(headers)
    style_sheet(ws, 3)
    if mode == 'pivot':
        ws['E4'] = '=SUM(B4:D4)'
        for col in ['B', 'C', 'D', 'E']:
            ws[f'{col}4'].number_format = '0'
    rules = wb.create_sheet('Rules')
    rules.append(['SYNTHETIC RULES — authoritative for these examples only'])
    rules.append([])
    rules.append(['ID', 'Type', 'Fields', 'Value'])
    config = [('C01', 'config', 'mode', mode), ('C02', 'config', 'key', 'Site' if mode != 'direct' else 'Item'), ('C03', 'config', 'header_row', '3'), ('C04', 'config', 'write_mode', 'replace')]
    if mode != 'direct':
        config += [('C05', 'config', 'categories', 'Jan|Feb|Mar'), ('C06', 'config', 'period', 'Period'), ('C07', 'config', 'value', 'Units')]
    if mode == 'pivot':
        config.append(('C08', 'config', 'total', 'Total'))
    for row in config:
        rules.append(row)
    for row in [
        ('A01', 'alias', 'Site', 'Site|Location|Branch|Entity'),
        ('A02', 'alias', 'Period', 'Period|Month|Interval'),
        ('A03', 'alias', 'Units', 'Units|Quantity|Value'),
        ('A04', 'alias', 'Item', 'Item|SKU|Item code'),
        ('A05', 'alias', 'Description', 'Description|Name'),
        ('A06', 'alias', 'Qty', 'Qty|Quantity'),
        ('R01', 'required', ','.join(headers), ''),
        ('R02', 'unique', 'Site' if mode == 'pivot' else ('Site,Period' if mode == 'long' else 'Item'), ''),
        ('R03', 'nonnegative', 'Jan,Feb,Mar,Total' if mode == 'pivot' else ('Units' if mode == 'long' else 'Qty'), ''),
    ]:
        rules.append(row)
    if mode == 'pivot':
        rules.append(('R04', 'sum', 'Total', 'Jan,Feb,Mar'))
    if mode == 'long':
        rules.append(('R04', 'allowed', 'Period', 'Jan|Feb|Mar'))
    style_sheet(rules, 3, 25)
    if mode == 'pivot':
        dv = DataValidation(type='whole', operator='greaterThanOrEqual', formula1=0)
        ws.add_data_validation(dv)
        dv.add('B4:D1000')
    wb.save(path)


def create_samples(folder: Path):
    folder.mkdir(parents=True, exist_ok=True)
    row_label_samples(folder)
    sasams_student_samples(folder)
    district_batch_samples(folder)
    target(folder / 'monthly-output-template.xlsx')
    target(folder / 'long-output-template.xlsx', 'long')
    target(folder / 'items-output-template.xlsx', 'direct')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Records'
    ws.append(['SYNTHETIC / export with title and blank rows'])
    ws.merge_cells('A1:C1')
    ws.append([])
    ws.append([])
    ws.append(['Location', 'Month', 'Quantity'])
    for row in [('North', 'Jan', 12), ('North', 'Feb', 18), ('North', 'Mar', 20)]:
        ws.append(row)
    style_sheet(ws, 4)
    wb.save(folder / 'north-messy.xlsx')
    ws.delete_rows(6)
    wb.save(folder / 'north-missing-feb.xlsx')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Cross tab'
    ws.append(['SYNTHETIC / sites across columns, months down rows'])
    ws.merge_cells('A1:C1')
    ws.append([])
    ws.append(['Period', 'South', 'West'])
    for row in [('Jan', 7, 9), ('Feb', 15, 11), ('Mar', 13, 15)]:
        ws.append(row)
    style_sheet(ws, 3)
    wb.save(folder / 'south-west-cross-tab.xlsx')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Wide export'
    ws.append(['SYNTHETIC / wide to long'])
    ws.append([])
    ws.append(['Branch', 'Jan', 'Feb', 'Mar'])
    ws.append(['North', 12, 18, 20])
    ws.append(['South', 7, 15, 13])
    style_sheet(ws, 3)
    wb.save(folder / 'wide-source.xlsx')
    (folder / 'items-source.csv').write_text('Item code,Name,Quantity\nSKU-001,Sample component,8\nSKU-002,Sample fitting,14\n', encoding='utf-8')
    (folder / 'items-unmapped.csv').write_text('Item code,Name,Boxes\nSKU-001,Sample component,8\nSKU-002,Sample fitting,14\n', encoding='utf-8')
    expected = Workbook()
    ew = expected.active
    ew.title = 'Output'
    ew.append(['Site', 'Jan', 'Feb', 'Mar', 'Total'])
    for row in [('North', 12, 18, 20, 50), ('South', 7, 15, 13, 35), ('West', 9, 11, 15, 35)]:
        ew.append(row)
    expected.save(folder / 'expected-pivot-output.xlsx')


def sample_case(folder: Path, case: str):
    if case == 'district_batch':
        return folder / 'School-A-Greenwood-High.xlsx', [
            folder / 'School-A-Greenwood-High.xlsx',
            folder / 'School-B-Horizon-Academy.xlsx',
            folder / 'School-C-Lakeside-Secondary.xlsx',
        ]
    if case == 'sasams_students':
        return folder / 'student-import-template.xlsx', [
            folder / 'sasams-sheet1-learner-parent-bio.xlsx',
            folder / 'sasams-sheet2-subject-marks.xlsx',
        ]
    if case == 'form':
        return folder / 'row-label-output-template.xlsx', [folder / 'row-label-source.xlsx']
    if case == 'unpivot':
        return folder / 'long-output-template.xlsx', [folder / 'wide-source.xlsx']
    if case == 'direct':
        return folder / 'items-output-template.xlsx', [folder / 'items-source.csv']
    if case == 'chat_map':
        return folder / 'items-output-template.xlsx', [folder / 'items-unmapped.csv']
    north = 'north-missing-feb.xlsx' if case == 'hold' else 'north-messy.xlsx'
    return folder / 'monthly-output-template.xlsx', [folder / north, folder / 'south-west-cross-tab.xlsx']


def sasams_student_samples(folder: Path):
    # 1. Normal Student System Import Template (NO Rules tab required, matching screenshots image-1.png & image-2.png)
    wb = Workbook()
    ws = wb.active
    ws.title = 'Students'
    headers = [
        'Student ID', 'First Name', 'Last Name', 'Date of Birth', 'Grade',
        'Subjects', 'Parent First Name', 'Parent Last Name', 'Parent Email', 'Parent Phone',
    ]
    ws.append(headers)
    style_sheet(ws, 1, 22)
    wb.save(folder / 'student-import-template.xlsx')

    # 2. SA-SAMS Sheet 1: Learner & Parent Bio Export
    wb1 = Workbook()
    ws1 = wb1.active
    ws1.title = 'Learner_Parent_Bio'
    ws1.append(['SA-SAMS LEARNER & PARENT DEMOGRAPHIC EXPORT — TERM 4'])
    ws1.merge_cells('A1:J1')
    ws1.append([])
    ws1.append([
        'Admission No', 'Learner First Name', 'Learner Surname', 'DOB', 'Grade',
        'Guardian First Name', 'Guardian Surname', 'Guardian Email', 'Guardian Cell', 'Gender',
    ])
    for row in [
        ('STU001', 'John', 'Doe', '15/03/2015', 8, 'Jane', 'Doe', 'jane.doe@example.com', 821234567, 'M'),
        ('STU002', 'Sarah', 'Smith', '2014-07-22', 9, 'Michael', 'Smith', 'michael.smith@example.com', '083 987 6543', 'F'),
        ('STU003', 'Emma', 'Johnson', '10/01/2016', 'Gr 7', 'Patricia', 'Johnson', 'patricia.johnson@example.com', '+27 84 765 4321', 'F'),
        ('STU004', 'Liam', 'Johnson', '2013/09/05', 10, 'Patricia', 'Johnson', 'patricia.johnson@example.com', '0847654321', 'M'),
    ]:
        ws1.append(row)
    style_sheet(ws1, 3, 20)
    wb1.save(folder / 'sasams-sheet1-learner-parent-bio.xlsx')

    # 3. SA-SAMS Sheet 2: Subject Marks Schedule (subjects across columns, percentages per learner row)
    wb2 = Workbook()
    ws2 = wb2.active
    ws2.title = 'Subject_Marks_Schedule'
    ws2.append(['SA-SAMS SUBJECT MARKS SCHEDULE (%) — VERTICAL SUBJECT COLUMNS'])
    ws2.merge_cells('A1:K1')
    ws2.append([])
    ws2.append([
        'Admission No', 'Learner First Name', 'Learner Surname', 'Grade',
        'Mathematics', 'English', 'Science', 'Physical Science', 'Natural Science', 'Geography', 'Average',
    ])
    for row in [
        ('STU001', 'John', 'Doe', 8, '78%', '82%', '74%', None, None, '-', 78.0),
        ('STU002', 'Sarah', 'Smith', 9, 85, 79, None, 88, None, 'N/A', 84.0),
        ('STU003', 'Emma', 'Johnson', 7, '91%', '87%', None, None, '84%', None, 87.3),
        ('STU004', 'Liam', 'Johnson', 10, 72, 68, None, 75, None, 80, 73.8),
        ('Average', '', '', '', 81.5, 79.0, 74.0, 81.5, 84.0, 80.0, 80.8),
    ]:
        ws2.append(row)
    style_sheet(ws2, 3, 18)
    wb2.save(folder / 'sasams-sheet2-subject-marks.xlsx')


def row_label_samples(folder: Path):
    wb = Workbook()
    ws = wb.active
    ws.title = 'Form'
    ws.append(['SYNTHETIC / row labels; entirely fictional values'])
    ws.append(['Field', 'Value'])
    ws.append(['Full name', 'Example Person'])
    ws.append(['Town', 'Sample City'])
    ws.append(['Request ref', 'REQ-001'])
    style_sheet(ws, 2)
    wb.save(folder / 'row-label-source.xlsx')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Output'
    ws.append(['SYNTHETIC / row-label destination'])
    ws.append([])
    ws.append(['Name', 'City', 'Reference'])
    style_sheet(ws, 3)
    rules = wb.create_sheet('Rules')
    rules.append(['ID', 'Type', 'Fields', 'Value'])
    for row in [('C1', 'config', 'mode', 'direct'), ('C2', 'config', 'key', 'Reference'), ('C3', 'config', 'header_row', '3'), ('C4', 'config', 'write_mode', 'replace'), ('A1', 'alias', 'Name', 'Name|Full name'), ('A2', 'alias', 'City', 'City|Town'), ('A3', 'alias', 'Reference', 'Reference|Request ref'), ('R1', 'required', 'Name,City,Reference', ''), ('R2', 'unique', 'Reference', '')]:
        rules.append(row)
    style_sheet(rules, 1)
    wb.save(folder / 'row-label-output-template.xlsx')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Output'
    ws.append(['Name', 'City', 'Reference'])
    ws.append(['Example Person', 'Sample City', 'REQ-001'])
    wb.save(folder / 'expected-row-label-output.xlsx')


def district_batch_samples(folder: Path):
    # 3 school spreadsheets for Multi-School District Folder Batch + SA ID Luhn & Ghost Learner Audit
    wb_a = Workbook()
    ws_a = wb_a.active
    ws_a.title = 'Learners'
    ws_a.append(['Student ID', 'Learner Name', 'SA ID Number', 'Grade', 'Parent Phone', 'Mathematics'])
    # STU001: Valid 13-digit SA ID 1503155123088 (Luhn digit 8), also enrolled at School B -> Ghost Learner duplicate!
    # STU002: 12-digit SA ID 803055123084 (born 2008-03-05, Excel stripped leading '0') -> Auto-repaired to '0803055123084'!
    ws_a.append(['STU001', 'John Doe', '1503155123088', 'Gr 8', 821234567, 78])
    ws_a.append(['STU002', 'thabo mokoena', 803055123084, 10, '083 987 6543', 64])
    style_sheet(ws_a, 1, 20)
    wb_a.save(folder / 'School-A-Greenwood-High.xlsx')

    wb_b = Workbook()
    ws_b = wb_b.active
    ws_b.title = 'Learners'
    ws_b.append(['Student ID', 'Learner Name', 'SA ID Number', 'Grade', 'Parent Phone', 'Mathematics'])
    # STU001: Cross-school duplicate ("Ghost Learner")
    # STU003: Invalid SA ID 1601100234089 (Luhn check digit 9 instead of 7)
    ws_b.append(['STU001', 'John Doe', '1503155123088', 'Grade 8', '0821234567', 78])
    ws_b.append(['STU003', 'Emma Johnson', '1601100234089', 'Gr 7', '0847654321', 28])
    style_sheet(ws_b, 1, 20)
    wb_b.save(folder / 'School-B-Horizon-Academy.xlsx')

    wb_c = Workbook()
    ws_c = wb_c.active
    ws_c.title = 'Learners'
    ws_c.append(['Student ID', 'Learner Name', 'SA ID Number', 'Grade', 'Parent Phone', 'Mathematics'])
    # STU004: Foreign Passport / Study Permit ID
    ws_c.append(['STU004', 'Chipo Ndlovu', 'P8492011', 'Grade 9', '+27 84 111 2233', 82])
    style_sheet(ws_c, 1, 20)
    wb_c.save(folder / 'School-C-Lakeside-Secondary.xlsx')

