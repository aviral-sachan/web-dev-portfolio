// 1. Select the calculator screen from the HTML
var screen = document.getElementById("screen");

// 2. Setup variables to track the state of the calculator
var welcomeText = "HELLO";
var shouldClearScreen = true;

// Visual transition helper for text flash/fade feedback
function triggerScreenTransition() {
    screen.classList.add('text-fade');
    setTimeout(function() {
        screen.classList.remove('text-fade');
    }, 80);
}

// 3. Function to handle when any button is pressed
function appendValue(buttonValue) {
    triggerScreenTransition();
    var currentText = screen.value;

        // --- BLOCK STARTING WITH ZERO ---
    if (buttonValue === "0") {
        // Condition A: If the screen is completely empty or just reset to '0'
        if (screen.value === "" || shouldClearScreen === true) {
            return; // Exit function completely and ignore the click!
        }
        
        // Condition B: If the very last character on screen is an operator (+, -, *, /, %)
        var lastChar = screen.value[screen.value.length - 1];
        if (lastChar === "+" || lastChar === "-" || lastChar === "*" || lastChar === "/" || lastChar === "%") {
            return; // Exit function completely so they can't type an operator followed by a 0!
        }
    }

    // --- FIX FOR CHAINING MATH ---
    if (shouldClearScreen === true) {
        if (buttonValue === "+" || buttonValue === "-" || buttonValue === "*" || buttonValue === "/" || buttonValue === "%") {
            shouldClearScreen = false;
        } 
        else {
            if (buttonValue === ".") {
                screen.value = "0.";
            } else {
                screen.value = buttonValue;
            }
            shouldClearScreen = false;
            return;
        }
    }

    // If the welcome message or an error is showing, replace it immediately
    if (screen.value === welcomeText || screen.value === "Error") {
        if (buttonValue === "+" || buttonValue === "*" || buttonValue === "/" || buttonValue === "%") {
            return; 
        }
        if (buttonValue === ".") {
            screen.value = "0.";
        } else {
            screen.value = buttonValue;
        }
        return;
    }

    // --- LOOP PRACTICE: Check for duplicate decimal points ---
    if (buttonValue === ".") {
        var hasDecimal = false;
        for (var i = screen.value.length - 1; i >= 0; i--) {
            var char = screen.value[i];
            if (char === "+" || char === "-" || char === "*" || char === "/" || char === "%") {
                break;
            }
            if (char === ".") {
                hasDecimal = true;
                break;
            }
        }
        if (hasDecimal === true) {
            return;
        }
    }

    // --- FIX FOR OPERATOR SWAPPING ---
    var lastCharacter = screen.value[screen.value.length - 1];
    var isLastCharOperator = (lastCharacter === "+" || lastCharacter === "-" || lastCharacter === "*" || lastCharacter === "/" || lastCharacter === "%");
    var isNewCharOperator = (buttonValue === "+" || buttonValue === "-" || buttonValue === "*" || buttonValue === "/" || buttonValue === "%");

    if (isLastCharOperator && isNewCharOperator) {
        var textWithoutLastChar = screen.value.substring(0, screen.value.length - 1);
        screen.value = textWithoutLastChar + buttonValue;
        return;
    }

    screen.value = screen.value + buttonValue;
}

// 4. Function for the AC button
function clearScreen() {
    triggerScreenTransition();
    screen.value = welcomeText;
    shouldClearScreen = true;
}

// 5. Function for the DEL button
function deleteLast() {
    triggerScreenTransition();
    var currentText = screen.value;
    
    if (currentText === welcomeText || currentText === "Error" || shouldClearScreen === true) {
        screen.value = "0";
        shouldClearScreen = true;
        return;
    }
    
    var simplifiedText = currentText.substring(0, currentText.length - 1);
    screen.value = simplifiedText;
    
    if (screen.value === "" || screen.value === "0") {
        screen.value = "0";
        shouldClearScreen = true;
    }
}

// 6. Function for the equal sign (=)
function calculateResult() {
    triggerScreenTransition();
    var expression = screen.value;
    
    var isValid = true;
    for (var i = 0; i < expression.length; i++) {
        var c = expression[i];
        var isNum = (c >= "0" && c <= "9");
        var isOp = (c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === ".");
        if (isNum === false && isOp === false) {
            isValid = false;
            break;
        }
    }
    
    if (isValid === false || expression === "") {
        screen.value = "Error";
        shouldClearScreen = true;
        return;
    }

    while (expression.indexOf("%") !== -1) {
        expression = expression.replace("%", "/100");
    }

    try {
        var rawResult = eval(expression);
        
        if (rawResult === Infinity || isNaN(rawResult)) {
            screen.value = "Error";
        } else {
            screen.value = Math.round(rawResult * 10000) / 10000;
        }
    } catch (err) {
        screen.value = "Error";
    }
    
    shouldClearScreen = true;
} // <-- The function securely ends here now!

// 7. Keyboard support added cleanly outside on its own level
document.addEventListener("keydown", function(event) {
    var key = event.key;

    if (key >= "0" && key <= "9") {
        appendValue(key);
    }
    
    if (key === "+" || key === "-" || key === "*" || key === "%" || key === ".") {
        appendValue(key);
    }
    
    if (key === "/") {
        event.preventDefault(); 
        appendValue("/");
    }
    
    if (key === "Enter" || key === "=") {
        event.preventDefault(); 
        calculateResult();
    }
    
    if (key === "Backspace") {
        deleteLast();
    }
    
    if (key === "Escape") {
        clearScreen();
    }
});
