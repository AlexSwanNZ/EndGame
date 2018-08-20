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

for(var i = 0; i <= cols; i++){
    column_head_letters[i] = num_to_let(i)
}

(window.draw_table = () => {
    for (var i = 0; i <= rows; i++) {
        var row = document.querySelector("table").insertRow(-1)
        for (var j = 0; j<= cols; j++) {
            var letter = column_head_letters[j]
            row.insertCell(-1).innerHTML = i && j ? `<input class='in' id='${letter}-${i}'/>` : i||letter
        }
    }
})()

focused_cell = $(`#${document.getElementById("A1")}`)

$(".in").css({
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

$(".in").focus( function(){

    blur_cell(focused_cell) //blur out the old selected cell
    focused_cell = $(this)

    $(this).css({ //highlight cell
        'background-color': focus_col,
        'text-align': 'left'
    })

    //Set the font buttons correctly
    var fw = $(this).prop('font-weight')
    if(fw === 'normal' || fw === undefined) $('#bold').prop('checked', false)
    else $('#bold').prop('checked', true)

    var fs = $(this).prop('font-style')
    if(fs === 'normal' || fs === undefined) $('#italic').prop('checked', false)
    else $('#italic').prop('checked', true)
    
    var tdec = $(this).prop('text-decoration')
    if(tdec === 'none' || tdec === undefined) $('#underline').prop('checked', false)
    else $('#underline').prop('checked', true)

})

//Font settings per cell
$(".selector").click( function() {
    
    if($(this).prop('id') === 'bold'){
        if($(this).prop('checked') === true) focused_cell.css({'font-weight': 'bold'})
        else focused_cell.css({'font-weight': 'normal'})
    }

    if($(this).prop('id') === 'italic'){
        if($(this).prop('checked') === true) focused_cell.css({'font-style': 'italic'})
        else focused_cell.css({'font-style': 'normal'})
    }

    if($(this).prop('id') === 'underline'){
        if($(this).prop('checked') === true) focused_cell.css({'text-decoration': 'underline'})
        else focused_cell.css({'text-decoration': 'none'})
    }

})

$(".in").keypress( function(e) {
    
    if(e.which === 13){
        //call evaluation function
            //if this cell is a function OR
            //if this cell is a dependency then trigger sheet evaluation
        var curr = focused_cell.prop('id').split('-')
        var toFocus = curr[0] + '-' + ((curr[1] % rows) + 1)
        $('#'+toFocus).focus()
    }
})

// $("*:not(.in)").focus( function(e){
//     console.log(e)
// })

$(".in").blur( function(e){
    //call evaluation function
    if(e.originalEvent.relatedTarget)
    blur_cell($(this))
})

$(".in").mouseover( function(){
    if(this.id !== focused_cell.prop('id'))
        $(this).css({'background-color': highlight_col})
})

$(".in").mouseout( function(){
    var focused = this.id === focused_cell.prop('id')
    $(this).css({'background-color': focused ? focus_col : bg_col})
})

focused_cell.focus() //why doesnt this work?

//each cell have ref to its dependants, evaluate

var blur_cell = (cell) => {
    cell.css({
        'background-color': bg_col,
        'text-align': 'right'
    })
}
