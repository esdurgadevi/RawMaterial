import { Parser } from 'expr-eval';

class FormulaEvaluator {
  constructor() {
    this.parser = new Parser();
  }

  /**
   * Evaluate a formula with given variables
   * @param {string} formula - The formula to evaluate (e.g., "[Total Kgs]*([Rate / kg]/[Rate Per])")
   * @param {Object} variables - Object containing variable values
   * @returns {number} - Calculated result
   */
  evaluate(formula, variables) {
    if (!formula || formula.trim() === '') {
      return 0;
    }

    try {
      // Replace [VariableName] with actual variable values
      let processedFormula = formula;
      const variablePattern = /\[([^\]]+)\]/g;
      
      // Extract all variables from the formula
      const matches = formula.match(variablePattern) || [];
      
      matches.forEach(match => {
        const varName = match.slice(1, -1); // Remove brackets
        let value = this.getVariableValue(varName, variables);
        
        // Handle potential string values
        if (isNaN(value)) value = 0;
        
        // Replace the variable with its actual value
        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processedFormula = processedFormula.replace(
          new RegExp(escapedMatch, 'g'), 
          value.toString()
        );
      });

      // Evaluate the mathematical expression
      const result = this.parser.evaluate(processedFormula);
      return isNaN(result) ? 0 : parseFloat(result.toFixed(2));
    } catch (error) {
      console.error('Formula evaluation error:', error, formula, variables);
      return 0;
    }
  }

  /**
   * Get variable value from the variables object
   */
  getVariableValue(varName, variables) {
    // Handle special cases
    switch(varName) {
      case 'Total Kgs':
        return variables.totalKgs || 0;
      case 'Rate / kg':
        return variables.ratePerKg || 0;
      case 'Rate Per':
        return variables.ratePer || 1;
      case 'CharityRs':
        return variables.charityRs || 0;
      case 'ChessRs':
        return variables.chessRs || 0;
      case 'TCSRS':
        return variables.tcsRs || 0;
      case 'GstAmt':
        return variables.gstAmt || 0;
      case 'IGstAmt':
        return variables.igstAmt || 0;
      default:
        return variables[varName] || 0;
    }
  }

  /**
   * Calculate all fields in order based on their formulas
   * @param {Array} fields - Array of field objects with formulas
   * @param {Object} baseVariables - Base variables (totalKgs, ratePerKg, etc.)
   * @returns {Object} - Calculated values mapped by fieldName and shortCode
   */
  calculateAllFields(fields, baseVariables) {
    const results = {};
    const variables = { ...baseVariables };

    // Sort fields by sequence
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);

    // Calculate each field in sequence
    sortedFields.forEach(field => {
      if (field.formula && field.formula.trim() !== '') {
        // Create a copy of variables including previously calculated results
        const evalVariables = { ...variables, ...results };
        
        // Calculate the value
        const value = this.evaluate(field.formula, evalVariables);
        
        // Store result using both fieldName and shortCode as keys
        results[field.fieldName] = value;
        results[field.shortCode] = value;
        
        // Also store in variables for subsequent calculations
        variables[field.fieldName] = value;
        variables[field.shortCode] = value;
      }
    });

    return results;
  }
}

export default new FormulaEvaluator();