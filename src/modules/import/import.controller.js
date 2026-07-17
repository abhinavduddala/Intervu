const importService = require('./import.service');
const { ValidationError } = require('../../errors/AppError');
const logger = require('../../utils/logger');

// Custom parser to extract JSON content from multipart/form-data upload without external libraries
const parseMultipartJson = (req) => {
  return new Promise((resolve, reject) => {
    let rawBody = [];
    req.on('data', (chunk) => {
      rawBody.push(chunk);
    });
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(rawBody);
        const data = buffer.toString('utf8');
        
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)/);
        if (!boundaryMatch) {
          return reject(new Error('Malformed multipart request: no boundary found'));
        }
        
        const boundary = boundaryMatch[1].trim();
        const parts = data.split(`--${boundary}`);
        
        // Find the part that contains the file upload content
        const filePart = parts.find(part => part.includes('filename=') || part.includes('Content-Type:'));
        if (!filePart) {
          return reject(new Error('No file part found in the multipart upload'));
        }
        
        // Extract the file content (which resides after the double newline)
        let headerEndIndex = filePart.indexOf('\r\n\r\n');
        let jsonStartIndex = headerEndIndex + 4;
        if (headerEndIndex === -1) {
          const lfHeaderEndIndex = filePart.indexOf('\n\n');
          if (lfHeaderEndIndex === -1) {
            return reject(new Error('Malformed multipart data headers'));
          }
          jsonStartIndex = lfHeaderEndIndex + 2;
        }
        
        let jsonContent = filePart.substring(jsonStartIndex);
        
        // Clean up trailing boundary hyphens or newlines
        jsonContent = jsonContent.trim();
        if (jsonContent.endsWith('--')) {
          jsonContent = jsonContent.slice(0, -2);
        }
        jsonContent = jsonContent.trim();
        
        const parsed = JSON.parse(jsonContent);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse uploaded JSON file: ${err.message}`));
      }
    });
    req.on('error', (err) => reject(err));
  });
};

const importQuestions = async (req, res, next) => {
  try {
    let questionsData;
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      questionsData = await parseMultipartJson(req);
    } else {
      // Standard JSON payload
      if (Array.isArray(req.body)) {
        questionsData = req.body;
      } else if (req.body && Array.isArray(req.body.questions)) {
        questionsData = req.body.questions;
      } else {
        throw new ValidationError('Invalid payload format. Expected a JSON array or a multipart JSON file.');
      }
    }

    if (!Array.isArray(questionsData)) {
      throw new ValidationError('Uploaded file/payload must be a valid JSON array of questions.');
    }

    const result = await importService.importQuestions(questionsData);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return next(err);
    }
    next(new ValidationError(err.message));
  }
};

module.exports = {
  importQuestions,
};
