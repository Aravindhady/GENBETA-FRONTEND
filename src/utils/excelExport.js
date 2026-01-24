import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exports data to an Excel file (.xlsx) with a blue theme table format
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to be downloaded
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = async (data, fileName = 'export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const columns = Object.keys(data[0]).map(key => ({
    header: key,
    key: key,
    width: Math.max(key.length + 5, 15)
  }));

  worksheet.columns = columns;
  worksheet.addRows(data);

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3F51B5' }
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
      size: 12
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    }
  });

  worksheet.autoFilter = {
    from: 'A1',
    to: {
      row: 1,
      column: columns.length
    }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Formats template details for Excel export with all questions, approvers, created date, and form ID
 * @param {Object} template - The template object
 * @returns {Array} Formatted data for export
 */
export const formatTemplateForExport = (template) => {
  const data = [];
  
  data.push({ Section: 'GENERAL INFORMATION', Key: '', Value: '' });
  data.push({ Section: 'General', Key: 'Form ID', Value: template._id });
  data.push({ Section: 'General', Key: 'Form Code', Value: template.formCode || 'N/A' });
  data.push({ Section: 'General', Key: 'Form Name', Value: template.formName || template.templateName });
  data.push({ Section: 'General', Key: 'Description', Value: template.description || 'N/A' });
  data.push({ Section: 'General', Key: 'Created Date', Value: new Date(template.createdAt).toLocaleDateString() });
  data.push({ Section: 'General', Key: 'Created Time', Value: new Date(template.createdAt).toLocaleTimeString() });
  data.push({ Section: 'General', Key: 'Status', Value: template.status || 'N/A' });
  
  data.push({ Section: '', Key: '', Value: '' });
  
  data.push({ Section: 'FORM QUESTIONS/FIELDS', Key: '', Value: '' });
  // Use ONLY one source: sections.fields OR top-level fields. Never both, to avoid duplicate rows.
  const sectionFields = template.sections?.flatMap(s => s.fields || []) || [];
  const topLevelFields = template.fields || [];
  const allFields = sectionFields.length > 0 ? sectionFields : topLevelFields;

  if (allFields.length > 0) {
    allFields.forEach((f, index) => {
      data.push({
        Section: 'Fields',
        Key: `Q${index + 1}: ${f.label}`,
        Value: `Type: ${f.type}${f.required ? ' (Required)' : ''}${f.options ? ` | Options: ${f.options.join(', ')}` : ''}`
      });
    });
  } else {
    data.push({ Section: 'Fields', Key: 'No fields defined', Value: '' });
  }
  
  data.push({ Section: '', Key: '', Value: '' });
  
  data.push({ Section: 'APPROVAL WORKFLOW', Key: '', Value: '' });
  const approvalFlow = template.approvalFlow || template.approvalLevels || [];
  if (approvalFlow.length > 0) {
    approvalFlow.forEach((level, index) => {
      data.push({ 
        Section: 'Approvers', 
        Key: `Level ${level.level || index + 1}`, 
        Value: level.approverId?.name || level.name || 'N/A' 
      });
    });
  } else {
    data.push({ Section: 'Approvers', Key: 'No approvers configured', Value: '' });
  }
  
  return data;
};

/**
 * Formats submission data for Excel export.
 * Rule: export ONLY submitted values — never loop template/form fields.
 * Single loop over submission data; template = structure, submission = truth.
 *
 * @param {Array} submissions - Array of submission objects
 * @returns {Array} Formatted data for export
 */
export const formatSubmissionsForExport = (submissions) => {
  return submissions.map((s) => {
    const submittedBy =
      typeof s.submittedBy === 'object'
        ? s.submittedBy?.name || s.submittedBy?.fullName || s.submittedBy?.email
        : s.submittedBy;

    const statusUpper = s.status?.toUpperCase();
    let stage = 'N/A';
    let approvalStatus = 'Pending';
    if (statusUpper === 'APPROVED') {
      stage = 'Completed';
      approvalStatus = 'Approved';
    } else if (statusUpper === 'REJECTED') {
      stage = 'Rejected';
      approvalStatus = 'Rejected';
    } else {
      stage = `Level ${s.currentLevel || 1}`;
      approvalStatus = 'Pending';
    }

    const row = {
      'Form ID': s._id,
      'Form Code': s.formCode || 'N/A',
      'Form Name':
        s.formName ||
        s.templateName ||
        s.templateId?.templateName ||
        s.templateId?.formName ||
        s.formId?.formName ||
        'Unknown Form',
      'Submitted By': submittedBy || 'Unknown',
      Date: new Date(s.createdAt || s.submittedAt).toLocaleString(),
      'Approval Status': approvalStatus,
      'Current Stage': stage,
      'Plant Name': s.plantName || s.plantId?.name || 'N/A'
    };

    if (s.approvalHistory && s.approvalHistory.length > 0) {
      s.approvalHistory.forEach((history, idx) => {
        row[`Level ${idx + 1} Approver`] = history.approverId?.name || 'N/A';
        row[`Level ${idx + 1} Action`] = history.status;
        row[`Level ${idx + 1} Date`] = history.actionedAt
          ? new Date(history.actionedAt).toLocaleString()
          : 'N/A';
      });
    }

    // Single source of truth: submission data only. Do NOT merge with form/template fields.
    const answers = s.data || s.responses || {};
    const seenKeys = new Set();
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const cellKey = `Data: ${key}`;
      if (typeof value !== 'object') {
        row[cellKey] = value;
      } else if (Array.isArray(value)) {
        row[cellKey] = value.every((v) => typeof v !== 'object')
          ? value.join(', ')
          : value.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v))).join(', ');
      } else {
        const flattened = Object.entries(value)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
        row[cellKey] = flattened;
      }
    }

    return row;
  });
};
