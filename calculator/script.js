var screen = document.getElementById("screen");

var welcomeText = "HELLO";
var shouldClearScreen = true;

function triggerScreenTransition() {
    screen.classList.add('text-fade');
    setTimeout(function() {
        screen.classList.remove('text-fade');
    }, 80);
}

function appendValue(buttonValue) {
    triggerScreenTransition();
    var currentText = screen.value;

    if (buttonValue === "0") {
        if (screen.value === "" || shouldClearScreen === true) {
        }
        
        var lastChar = screen.value[screen.value.length - 1];
        if (lastChar === "+" || lastChar === "-" || lastChar === "*" || lastChar === "/" || lastChar === "%") {
            return; 
        }
    }

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

function clearScreen() {
    triggerScreenTransition();
    screen.value = welcomeText;
    shouldClearScreen = true;
}

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
}

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
}  );
