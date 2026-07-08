const fs = require("fs");
const csv = require("csv-parser");

class CSVService {
    /**
     * Parses a CSV file and returns cleaned JSON data
     * @param {string} filePath - Path to the uploaded file
     * @returns {Promise<Array>} - Resolves to an array of cleaned objects
     */
    static parseCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            
            // Check if file exists before streaming
            if (!fs.existsSync(filePath)) {
                return reject(new Error("File not found on server."));
            }

            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    // Clean each row as it comes in
                    results.push(this.cleanRow(row));
                })
                .on("end", () => {
                    if (results.length === 0) {
                        return reject(new Error("The CSV file is empty."));
                    }
                    resolve(results);
                })
                .on("error", (err) => {
                    console.error("❌ CSV Parsing Stream Error:", err);
                    reject(err);
                });
        });
    }

    /**
     * Cleans an entire row object
     */
    static cleanRow(row) {
        const cleaned = {};
        for (const [key, value] of Object.entries(row)) {
            // Trim whitespace from headers/keys and parse the values
            const cleanKey = key.trim();
            cleaned[cleanKey] = this.parseValue(value);
        }
        return cleaned;
    }

    /**
     * Smart-parses values into Numbers, Dates, or Strings
     */
    static parseValue(value) {
        if (value === null || value === undefined || value === '') return null;
        
        const stringValue = value.toString().trim();

        // 1. Handle Percentages (e.g., "15%")
        if (stringValue.endsWith('%')) {
            const num = parseFloat(stringValue.replace('%', ''));
            return !isNaN(num) ? num / 100 : stringValue;
        }

        // 2. Handle Currency and Commas (e.g., "$1,200.50" or "1,000,000")
        // We remove $, €, £, and commas
        const currencyRegex = /[$,£€]/g;
        const cleanNumString = stringValue.replace(currencyRegex, '').replace(/,/g, '');
        
        // 3. Check if it's a valid Number
        if (cleanNumString !== '' && !isNaN(cleanNumString)) {
            return parseFloat(cleanNumString);
        }

        // 4. Check if it's a Date
        // We check for common date patterns (contains / or -) and length > 5
        if ((stringValue.includes('-') || stringValue.includes('/')) && stringValue.length > 5) {
            const date = new Date(stringValue);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        }

        // 5. Return as cleaned string if no other types match
        return stringValue;
    }
}

module.exports = CSVService;