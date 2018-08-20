/**
 * Spreadsheet program
 * Creates a spreadsheet from a HTML table
 * 
 * Author: Alex Swan
 */

const cols = 10
const rows = 10

var column_head_letters = []
var log = document.getElementById("log")

/**
 * Utility function
 * Writes a line to a page
 * @param {object} t line to write to page
 */
var logLine = (t) => { log.innerHTML += t + '\n' }

//I wonder if this would be faster done more procedurally...
/**
 * Converts a number to spreadsheet letter code recursively
 * eg. A->Z, AA-> CY, AAA -> DHX etc...
 * @param {number} num number to convert to letter(s)
 * @param {string} str string of existing letters
 */
var num_to_let = (num, str) => {
    
    var inp = ((num - 1) % 26) + 65
    if(num > 26){
        var new_string = String.fromCharCode(inp) + str
        var new_num = Math.floor((num - 1) / 26)
        return num_to_let(new_num, new_string)
    }
    return String.fromCharCode(inp) + str

}

/*****************************************BEGIN SCRIPT***********************************************/

//TODO: Refresh button in top corner

//Populate column header array
for(var i = 0; i <= cols; i++){
    column_head_letters[i] = num_to_let(i, '')
}

(window.draw_table = () => {
    for (var i = 0; i <= rows; i++) {
        var row = document.querySelector("table").insertRow(-1)
        for (var j = 0; j<= cols; j++) {
            var letter = column_head_letters[j]
            row.insertCell(-1).innerHTML = i&&j ? "<input id='" + letter+i + "'/>" : i||letter
        }
    }
})()

var DATA = {}
var INPUTS = [...document.querySelectorAll("input")];//ES6 only

var computeAll = () => {
    INPUTS.forEach((elm) => { try { elm.value = DATA[elm.id] } catch(e) {} })
}

INPUTS.forEach( (elm) => {
    elm.value = localStorage[elm.id] || "" //Gets the value from storage
    elm.onblur = (e) => {
        localStorage[e.target.id] = e.target.value;
        computeAll()
    }
    var getter = () => { //Why can't I extract this function??? Scopes..?
        var value = localStorage[elm.id] || ""
        if (value.charAt(0) === "=") with (DATA) return eval(value.substring(1))
        else return isNaN(parseFloat(value)) ? value : parseFloat(value)
    }
    Object.defineProperty(DATA, elm.id, {get:getter})
    Object.defineProperty(DATA, elm.id.toLowerCase(), {get:getter})
})

computeAll()

/*******************************************END SCRIPT***********************************************/



$("#A1").focus() //Focus first cell

$("input").css({
    'border': 'none',
    'width': '80px',
    'font-size': '14px',
    'padding': '2px'
})

$("tr:first-child").css({
    'background-color': '#ccc',
    'padding': '1px 3px',
    'font-weight': 'bold',
    'text-align': 'center'
})

$("td:first-child").css({
    'background-color': '#ccc',
    'padding': '1px 3px',
    'font-weight': 'bold',
    'text-align': 'center'
})

$("td").css({
    'border': '1px solid #999',
    'padding': '0'
})

$("table").css({'border-collapse': 'collapse'})

//Not working
$("input").focus( () => {
    $(this).css({'background-color': '#ccf'})
})


