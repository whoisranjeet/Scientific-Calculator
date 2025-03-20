$(document).ready(function() {
    let display = $('#display');
    let currentInput = '';
    let fullExpression = '';
    let parenthesesCount = 0;

    // Function to update the display
    function updateDisplay() {
        let displayText = fullExpression + currentInput;
        display.text(displayText || '0');
    }

    // Function to format number
    function formatNumber(num) {
        if (isNaN(num)) return 'Error';
        
        // Convert to number and limit decimal places
        let result = parseFloat(parseFloat(num).toFixed(10));
        return result.toString();
    }

    // Function to evaluate mathematical expression safely
    function calculateExpression(expression) {
        try {
            // Replace mathematical operations
            expression = expression.replace(/\^/g, '**')  // Replace ^ with **
                                 .replace(/([0-9.]+|[)])\s*%/g, (match, p1) => `(${p1}/100)`); // Handle percentage

            // Handle scientific functions
            let mathFunctions = {
                'sin': 'Math.sin',
                'cos': 'Math.cos',
                'tan': 'Math.tan',
                'log': 'Math.log10',
                'sqrt': 'Math.sqrt',
                'exp': 'Math.exp'
            };

            for (let func in mathFunctions) {
                let regex = new RegExp(func + '\\(', 'g');
                expression = expression.replace(regex, mathFunctions[func] + '(');
            }

            // Validate expression
            if (!/^[0-9+\-*/().%\s^e\w]+$/.test(expression)) {
                throw new Error('Invalid characters in expression');
            }

            // Evaluate and return result
            let result = new Function('return ' + expression)();
            return formatNumber(result);
        } catch (error) {
            console.error('Calculation error:', error);
            return 'Error';
        }
    }

    // Handle button clicks
    $('.btn').click(function() {
        let value = $(this).text();

        // Handle numbers and decimal point
        if ($.isNumeric(value) || value === '.') {
            if (value === '.' && currentInput.includes('.')) return;
            currentInput += value;
            updateDisplay();
        }
        // Handle parentheses
        else if (value === '(' || value === ')') {
            if (value === '(') {
                if (currentInput !== '') {
                    fullExpression += currentInput + '*';
                    currentInput = '';
                }
                parenthesesCount++;
            } else if (value === ')' && parenthesesCount > 0) {
                if (currentInput !== '') {
                    fullExpression += currentInput;
                    currentInput = '';
                }
                parenthesesCount--;
            }
            fullExpression += value;
            updateDisplay();
        }
        // Handle clear operations
        else if (value === 'C') {
            currentInput = '';
            fullExpression = '';
            parenthesesCount = 0;
            updateDisplay();
        }
        else if (value === 'CE') {
            currentInput = '';
            updateDisplay();
        }
        else if (value === '⌫') {
            if (currentInput !== '') {
                currentInput = currentInput.slice(0, -1);
            } else if (fullExpression !== '') {
                fullExpression = fullExpression.slice(0, -1);
            }
            updateDisplay();
        }
        // Handle toggle sign
        else if (value === '±') {
            if (currentInput !== '') {
                currentInput = currentInput.startsWith('-') ? 
                    currentInput.substring(1) : '-' + currentInput;
                updateDisplay();
            }
        }
        // Handle equals
        else if (value === '=') {
            if (currentInput !== '' || fullExpression !== '') {
                let expression = fullExpression + currentInput;
                // Close any remaining open parentheses
                while (parenthesesCount > 0) {
                    expression += ')';
                    parenthesesCount--;
                }
                let result = calculateExpression(expression);
                display.text(result);
                if (result !== 'Error') {
                    currentInput = result;
                    fullExpression = '';
                    parenthesesCount = 0;
                }
            }
        }
        // Handle scientific functions
        else if (['sin', 'cos', 'tan', 'log', 'sqrt', 'exp'].includes(value)) {
            if (currentInput !== '') {
                fullExpression += value + '(' + currentInput + ')';
                currentInput = '';
                updateDisplay();
            }
        }
        // Handle operators
        else if (['+', '-', '*', '/', '^', '%'].includes(value)) {
            if (currentInput !== '' || fullExpression !== '') {
                if (currentInput !== '') {
                    fullExpression += currentInput;
                    currentInput = '';
                }
                // Check if the last character is an operator
                let lastChar = fullExpression.slice(-1);
                if (!['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
                    fullExpression += value;
                } else if (value === '-' && lastChar !== '-') {
                    // Allow negative numbers after operators
                    currentInput = '-';
                }
                updateDisplay();
            } else if (value === '-') {
                // Allow negative number at start
                currentInput = '-';
                updateDisplay();
            }
        }
    });

    // Handle keyboard input
    $(document).on('keydown', function(e) {
        let key = e.key;
        
        // Handle numbers and operators
        if ($.isNumeric(key) || ['+', '-', '*', '/', '.', '(', ')', '^'].includes(key)) {
            e.preventDefault();
            $('.btn').filter(function() {
                return $(this).text() === key;
            }).click();
        }
        // Handle Enter as equals
        else if (key === 'Enter') {
            e.preventDefault();
            $('.btn').filter(function() {
                return $(this).text() === '=';
            }).click();
        }
        // Handle Escape as clear
        else if (key === 'Escape') {
            e.preventDefault();
            $('.btn').filter(function() {
                return $(this).text() === 'C';
            }).click();
        }
        // Handle Backspace
        else if (key === 'Backspace') {
            e.preventDefault();
            $('.btn').filter(function() {
                return $(this).text() === '⌫';
            }).click();
        }
    });
});
