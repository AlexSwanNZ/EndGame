/**
 * Spreadsheet program
 * Creates a spreadsheet from a HTML table using JQuery
 * 
 * Author: Alex Swan
 */

const cols = 10
const rows = 10

const functions = [
    /(sum|SUM)\([A-Z]+[0-9]+:[A-Z]+[0-9]+\)/gm,
    /(ifeq|IFEQ)\([A-Z]+[0-9]+(,[A-Z]+[0-9]+){3}\)/gm
]

var column_head_letters = []

var DATA = new Map()
var LINKS = new Map()

var bg_col = '#fff',
    highlight_col = '#eee',
    focus_col = '#ccf',
    cell_width = 80

var num_to_let = (num, str = '') => {
    
    var inp = ((num - 1) % 26) + 65
    if(num > 26){
        var new_string = String.fromCharCode(inp) + str
        var new_num = Math.floor((num - 1) / 26)
        return num_to_let(new_num, new_string)
    }
    return String.fromCharCode(inp) + str

}

var unique_array = (array) => {
    if(!array) return array
    var unique = []
    array.forEach( function(e){
        if(unique.indexOf(e) === -1) unique.push(e)
    })
    return unique
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

var evaluate = (cell) => {
    
    var id = cell.prop('id')
    var formula = cell.prop('value')

    //Flags
    var delete_cell = formula.length == 0
    var new_cell = !DATA.has(id)
    var modify_cell = !new_cell
    var no_input = formula.length == 0 && new_cell

    if(no_input) return

    //list of unique links to other cells before and after change
    var old_refs = new_cell ? undefined : get_refs(DATA.get(id).formula)
    var new_refs = get_refs(formula)

    if(delete_cell){

        remove_old_links(id, old_refs)
        DATA.delete(id)

    }

    else if(new_cell){

        refresh_cell(id, formula, new_refs)
        add_new_links(id, new_refs)

    }
    
    else if(modify_cell){

        refresh_cell(id, formula, new_refs)
        remove_old_links(id, old_refs)
        add_new_links(id, new_refs)

    }
    
    update_refs(id)
    save()

}

var update_refs = (id) => {
    var update = LINKS.get(id)
    if(update){ update.forEach( function(c){
        refresh_links(c)
    })}
}

var refresh_links = (id) => {
    var formula = DATA.get(id).formula
    refresh_cell(id, formula, get_refs(formula))
    update_refs(id)
}

var compute = (formula, new_refs) => {

    //cant just jump in and replace all refs because there might be a function
    //finding references will need to operate completely differently but that can be sorted later

    var is_function = formula.charAt(0) === '='
    if(is_function){ functions.forEach( function(f){
        console.log('checking function: ' + f)
        var funcs = formula.match(f)
        if(funcs){ funcs.forEach( function(func){
            if(func.toLowerCase().startsWith('sum'))
                formula = formula.replace(funcs[0], sum(func))
            else if(func.toLowerCase().startsWith('ifeq'))
                formula = formula.replace(funcs[0], ifeq(func))
        })}
    })}
    console.log(formula)

    try{ if(new_refs){ new_refs.forEach(function(ref) { //error in here for parsing multiple functions
        var dat = DATA.get(hyphenate(ref))
        var res = dat.value
        do{ formula = formula.replace(ref, res) }
        while(formula.includes(ref))
    })}}catch(e){ return "#ERROR" }
    return is_function ? eval(formula.substring(1)) : formula
}

var ifeq = (formula) => {

    var c = formula.match(/[A-Z]+[0-9]+/gm)

    var cells = []
    cells[0] = DATA.get(hyphenate(c[0]))
    cells[1] = DATA.get(hyphenate(c[1]))
    cells[2] = DATA.get(hyphenate(c[2]))
    cells[3] = DATA.get(hyphenate(c[3]))

    var all_cells_defined = cells[0] && cells[1] && cells[2] && cells[3]

    if(all_cells_defined){

        val_a = Number(cells[0].value)
        val_b = Number(cells[1].value)
        return val_a === val_b ? Number(cells[2].value) : Number(cells[3].value)

    }

}

var sum = (formula) => {
    var refs = refs_in_range(formula.match(/[A-Z]+[0-9]+:[A-Z]+[0-9]+/gm)[0])
    var s = 0
    refs.forEach( function(ref){
        var val = DATA.get(hyphenate(ref))
        if(val) s += Number(val.value)
    })
    return s
}

var refresh_cell = (id, formula, new_refs) => {
    var result = compute(formula, new_refs)
    DATA.set(id, {
        'value': result,
        'formula': formula
    })
    $(`#${id}`).prop('value', result)
}

var remove_old_links = (id, old_refs) => {
    if(old_refs){ 
        old_refs.forEach(function(ref) {
            var href = hyphenate(ref)
            var list = LINKS.get(href)
            list.splice(ref.indexOf(id), 1)
            if(list.length === 0) LINKS.delete(href)
        })
    }
}

var add_new_links = (id, new_refs) => {
    if(new_refs) new_refs.forEach(function(ref) {
        var href = hyphenate(ref)
        if(!LINKS.has(href)) LINKS.set(href, [])
        LINKS.get(href).push(id)
    })
}

var get_refs = (formula) => {

    var range_refs = []
    if(formula.includes(':')){

        var ranges = formula.match(/[A-Z]+[0-9]+:[A-Z]+[0-9]+/gm)
        ranges.forEach( function(range){
            range_refs = range_refs.concat(refs_in_range(range))
        })

    }

    var in_formula = formula.match(/[A-Z]+[0-9]+/gm)
    if(range_refs.length === 0) return unique_array(in_formula)
    if(in_formula) return unique_array(in_formula.concat(range_refs))
    return unique_array(range_refs)

}

var refs_in_range = (range) => {
    
    range_refs = []
    var letters = range.match(/[A-Z]+/gm)
    var a_idx = column_head_letters.indexOf(letters[0])
    var b_idx = column_head_letters.indexOf(letters[1])
    var min_idx = a_idx < b_idx ? a_idx : b_idx
    var max_idx = a_idx > b_idx ? a_idx : b_idx
    
    var numbers = range.match(/[0-9]+/gm)
    var num_a = Number(numbers[0])
    var num_b = Number(numbers[1])
    var min_num = num_a < num_b ? num_a : num_b
    var max_num = num_a > num_b ? num_a : num_b
    
    for(i = min_idx; i <= max_idx; i++){
        var letter = column_head_letters[i]
        for(j = min_num; j <= max_num; j++){
            range_refs.push(letter + j)
        }
    }
    return range_refs

}

var hyphenate = (str) => {
    var index = str.indexOf(str.match(/\d/))
    return str.substring(0, index) + "-" + str.substring(index)
}

var save = () => {
    //get list of keys
    //store each key in localstorage with JSON value of object in map
}

var clear = () => {
    //clear reference array and localStorage
    //redraw (inefficient) or clear each cell
}

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

$(".selector").click( function() {
    
    var box = $(this).prop('id')
    var checked = $(this).prop('checked')
    if(box === 'bold') focused_cell.css('font-weight', checked ? 'bold': 'normal')
    if(box === 'italic') focused_cell.css('font-style', checked ? 'italic' : 'normal')
    if(box === 'underline') focused_cell.css('text-decoration', checked ? 'underline' : 'none')

})

$(".in").keypress( function(e) {
    if(e.key === 'Enter' || e.key === 'ArrowDown'){
        var curr = focused_cell.prop('id').split('-')
        var toFocus = curr[0] + '-' + ((curr[1] % rows) + 1)
        $('#'+toFocus).focus()
    }
    // else if(e.key === 'ArrowUp'){
    //     var curr = focused_cell.prop('id').split('-')
    //     var toFocus = curr[0] + '-' + ((curr[1] + rows - 1) % rows)
    //     $('#'+toFocus).focus()
    // }
})

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


$(".in").blur( function(e){
    evaluate($(this))
    $(this).css({
        'text-align': 'right'
    })
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

focused_cell = $(`#A-1`) //Not working...

$(".in").keypress( function(e) {
    if(e.which === 0){
        for (var [key, value] of LINKS) { console.log(key + ': ' + value); }
    }
})