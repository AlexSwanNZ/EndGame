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

var DATA = new Map()
var LINKS = new Map()

var bg_col = '#fff',
    highlight_col = '#eee',
    focus_col = '#ccf',
    cell_width = 80

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
            row.insertCell(-1).innerHTML = i && j ? '<input class="in" id="' + letter + '-' + i + '">' : i||letter
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

    //Evaluates previous cell
    blur_cell(focused_cell)
    focused_cell = $(this)
    var id = focused_cell.prop('id')

    //Highlight current cell
    $(this).css({
        'background-color': focus_col,
        'text-align': 'left'
    })

    //Display the underlying formula for selected cell
    var disp = DATA.has(id) ? DATA.get(id).formula : undefined
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
        //Focus next cell
        var curr = focused_cell.prop('id').split('-')
        var toFocus = curr[0] + '-' + ((curr[1] % rows) + 1)
        $('#'+toFocus).focus()
    }
})

var evaluate = (cell) => {
    
    var id = cell.prop('id')
    var formula = cell.prop('value')

    //Flags
    var DELETE_CELL = formula.length == 0
    var NEW_CELL = !DATA.has(id)
    var MODIFY_CELL = !NEW_CELL
    var NO_INPUT = formula.length == 0 && NEW_CELL

    if(NO_INPUT) return

    //list of links to other cells before and after change
    var old_refs = NEW_CELL ? undefined : get_refs(DATA.get(id).formula)
    var new_refs = get_refs(formula)

    if(DELETE_CELL){

        remove_old_links(id, old_refs)
        DATA.delete(id)

    }

    else if(NEW_CELL){

        refresh_cell(id, formula, eval(computable(formula, new_refs)))
        add_new_links(id, new_refs)

    }
    
    else if(MODIFY_CELL){

        refresh_cell(id, formula, eval(computable(formula, new_refs)))
        remove_old_links(id, old_refs)
        add_new_links(id, new_refs)

    }
        
    //Now call cells that might reference it
    //No point doing this until coding for errors is done

    save()

}

var computable = (formula, new_refs) => {
    if(new_refs){ new_refs.forEach(function(ref) {
        var res = DATA.get(hyphenate(ref)).value
        formula = formula.replace(ref, res)
    })}
    return formula.charAt(0) !== '=' ? formula : formula.substring(1)
}

var refresh_cell = (id, formula, result) => {
    DATA.set(id, {
        'value': result,
        'formula': formula
    })
    $(`#${id}`).prop('value', result)
}

var remove_old_links = (id, old_refs) => {
    if(old_refs){ old_refs.forEach(function(ref) {
            LINKS.get(hyphenate(ref)).splice(ref.indexOf(id), 1)
    })}
}

var add_new_links = (id, new_refs) => {
    if(new_refs) new_refs.forEach(function(ref) {
        var href = hyphenate(ref)
        if(!LINKS.has(href)) LINKS.set(href, [])
        LINKS.get(href).push(id)
    })
}

//console.log(DATA.get(cell_id))
//for (var [key, value] of DATA) { console.log(key + ' = ' + value); }


/**
 * Get all the cell references contained in a formula
 * @param {string} formula 
 */
var get_refs = (formula) => {
    return formula.match(/[A-Z]+[0-9]+/gm)
}

var hyphenate = (str) => {
    var index = str.indexOf(str.match(/\d/))
    return str.substring(0, index) + "-" + str.substring(index)
}

var dehyphenate = (str) => {

}

var save = () => {
    //get list of keys
    //store each key in localstorage with JSON value of object in map
}

var clear = () => {
    //clear reference array and localStorage
    //redraw (inefficient) or clear each cell
}

//Blur evaluates a cell
$(".in").blur( function(e){
    evaluate($(this))
})

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
}

focused_cell.focus() //why doesnt this work?

// DATA.set('f', 'g')
// for (var [key, value] of DATA) {
//     console.log(key + ' = ' + value);
// }

// $("*:not(.in)").focus( function(e){
//     console.log(e)
// })
