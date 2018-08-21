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

var cells = new Map()
// localStorage['data'] = JSON.stringify(Array.from(cells.entries()));

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

for(var i = 0; i <= cols; i++){ column_head_letters[i] = num_to_let(i) }

(window.draw_table = () => {
    for (var i = 0; i <= rows; i++) {
        var row = document.querySelector("table").insertRow(-1)
        for (var j = 0; j<= cols; j++) {
            var letter = column_head_letters[j]
            row.insertCell(-1).innerHTML = i && j ? `<input class='in' id='${letter}-${i}'/>` : i||letter
            //load cell contents/parameters here
        }
    }
})()

focused_cell = $(`#${document.getElementById("A1")}`) //Not working...

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

    blur_cell(focused_cell)
    focused_cell = $(this)
    var id = focused_cell.prop('id')

    $(this).css({
        'background-color': focus_col,
        'text-align': 'left'
    })

    var disp = cells.has(id) ? JSON.parse(cells.get(id)).text : undefined
    if(disp) $(this).val(disp)

    //Set the font buttons correctly
    $('#bold').prop('checked', ($(this).css('font-weight') == 700) ? true : false)
    $('#italic').prop('checked', ($(this).css('font-style') === 'italic') ? true : false)
    $('#underline').prop('checked', $(this).css('text-decoration') === 'underline' ? true : false)

})

//Font settings per cell
$(".selector").click( function() {
    
    var box = $(this).prop('id')
    var checked = $(this).prop('checked')
    if(box === 'bold') focused_cell.css('font-weight', checked ? 'bold': 'normal')
    if(box === 'italic') focused_cell.css('font-style', checked ? 'italic' : 'normal')
    if(box === 'underline') focused_cell.css('text-decoration', checked ? 'underline' : 'none')

})

$(".in").keypress( function(e) {
    if(e.which === 13){
        $(this).blur()
        var curr = focused_cell.prop('id').split('-')
        var toFocus = curr[0] + '-' + ((curr[1] % rows) + 1)
        $('#'+toFocus).focus()
    }
})

var evaluate = (cell) => {
    
    var cell_id = cell.prop('id')
    var cell_text = cell.prop('value')
    var exists = cells.has(cell_id)
    var refs = exists ? cells.get(cell_id).refs : undefined

    //If the cell is blank remove it unless it is referenced elsewhere
    if(cell_text.length == 0){
        if(!exists) return
        if(refs) cells.set(cell_id, JSON.stringify({
            'result': '',
            'text': '',
            'refs': refs
        }))
        return cells.delete(cell.prop('id'))
    }

    var result = calculate(cell)
    cells.set(cell_id, JSON.stringify({
        'result': result,
        'text': cell_text,
        'refs': refs
    }))

    //console.log(result)
    cell.prop('value', result)
    
    //console.log(cells.get(cell_id))
    // for (var [key, value] of cells) { console.log(key + ' = ' + value); }
    
    save() //save the map

}

var calculate = (cell) => {
    var text = cell.prop('value')
    if(typeof text === 'number') return text
    if(text.charAt(0) !== '=') return text

    //big boy stuff
    //first thing to do is evaluate functions but that is later...
    return eval(text.substring(1))

}

var save = () => {
    //get list of keys
    //store each key in localstorage with JSON value of object in map
}

var clear = () => {
    //clear reference array and localStorage
    //redraw (inefficient) or clear each cell
}

$(".in").blur( function(e){ evaluate($(this)) })

$(".in").mouseover( function(){
    if(this.id !== focused_cell.prop('id'))
        $(this).css({'background-color': highlight_col})
})

$(".in").mouseout( function(){
    var focused = this.id === focused_cell.prop('id')
    $(this).css({'background-color': focused ? focus_col : bg_col})
})

var blur_cell = (cell) => {
    cell.css({
        'background-color': bg_col,
        'text-align': 'right'
    })
    var exists = cells.has(cell.prop('id'))
    //if(exists) cell.val(JSON.parse(cells.get(id)).text)
}

focused_cell.focus() //why doesnt this work?

// cells.set('f', 'g')
// for (var [key, value] of cells) {
//     console.log(key + ' = ' + value);
// }

// $("*:not(.in)").focus( function(e){
//     console.log(e)
// })
