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

var bg_col = '#fff',
    highlight_col = '#eee',
    focus_col = '#ccf',
    cell_width = 80

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
var num_to_let = (num, str = '') => {
    
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
    column_head_letters[i] = num_to_let(i)
}

(window.draw_table = () => {
    for (var i = 0; i <= rows; i++) {
        var row = document.querySelector("table").insertRow(-1)
        for (var j = 0; j<= cols; j++) {
            var letter = column_head_letters[j]
            row.insertCell(-1).innerHTML = i&&j ? "<input id='" + letter+'-'+i + "'/>" : i||letter
        }
    }
})()

var DATA = {}
var INPUTS = [...document.querySelectorAll("input")];//ES6 only

// INPUTS.forEach((elm) => { //work on replacing with jquery...
//     elm.onfocus = (e) => e.target.value = localStorage[e.target.id] || ""
//     elm.onblur = (e) => {
//         localStorage[e.target.id] = e.target.value;
//         computeAll()
//     }
//     var getter = function() { //Why can't I extract this function??? Scopes..?
//         var value = localStorage[elm.id] || ""
//         if (value.charAt(0) === "=") with (DATA) return eval(value.substring(1)) //How to get rid of 'with'?
//         else return isNaN(parseFloat(value)) ? value : parseFloat(value)
//     }
//     Object.defineProperty(DATA, elm.id, {get:getter})
//     Object.defineProperty(DATA, elm.id.toLowerCase(), {get:getter})
// })

// var computeAll = () => INPUTS.forEach((elm) => {
//     try { elm.value = DATA[elm.id] }
//     catch(e) {}
// })

// computeAll()

/*******************************************END SCRIPT***********************************************/

$("input").css({
    'text-align': 'right',
    'border': 'none',
    'font-size': '14px',
    'padding': '2px'
})
.width(cell_width)

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

$("input").focus( function(){
    $(this).css({
        'background-color': focus_col,
        'text-align': 'left'
    })
})

$("input").blur( function(){
    $(this).css({
        'background-color': bg_col,
        'text-align': 'right'
    })
})

$("input").mouseover( function(){
    if(this.id !== document.activeElement.id)
        $(this).css({'background-color': highlight_col})
})

$("input").mouseout( function(){
    var focused = this.id === document.activeElement.id
    $(this).css({'background-color': focused ? focus_col : bg_col})
})

$("input").keypress( function(e) {
    if(e.which === 13){
        //evaluate()
        var curr = document.activeElement.id.split('-')
        var toFocus = curr[0] + '-' + ((curr[1] % rows) + 1)
        $('#'+toFocus).focus()
    }
})

//Enter button handler


$(document).ready( function(){
    $("#A-4").focus() //Why not working?
})
