(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File === 'function' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[94m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.du.a6 === region.dX.a6)
	{
		return 'on line ' + region.du.a6;
	}
	return 'on lines ' + region.du.a6 + ' through ' + region.dX.a6;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return word
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fg,
		impl.fB,
		impl.fy,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = A2(update, msg, model);
		stepper(model = result.a, viewMetadata);
		_Platform_dispatchEffects(managers, result.b, subscriptions(model));
	}

	_Platform_dispatchEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				p: bag.n,
				q: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.q)
		{
			x = temp.p(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		r: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		r: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		P: func(record.P),
		dw: record.dw,
		dn: record.dn
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.P;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.dw;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.dn) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fg,
		impl.fB,
		impl.fy,
		function(sendToApp, initialModel) {
			var view = impl.fC;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fg,
		impl.fB,
		impl.fy,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.ds && impl.ds(sendToApp)
			var view = impl.fC;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.K);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.dC) && (_VirtualDom_doc.title = title = doc.dC);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.fo;
	var onUrlRequest = impl.fp;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		ds: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.es === next.es
							&& curr.d2 === next.d2
							&& curr.en.a === next.en.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		fg: function(flags)
		{
			return A3(impl.fg, flags, _Browser_getUrl(), key);
		},
		fC: impl.fC,
		fB: impl.fB,
		fy: impl.fy
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { d1: 'hidden', e4: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { d1: 'mozHidden', e4: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { d1: 'msHidden', e4: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { d1: 'webkitHidden', e4: 'webkitvisibilitychange' }
		: { d1: 'hidden', e4: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		eD: _Browser_getScene(),
		eZ: {
			c_: _Browser_window.pageXOffset,
			c$: _Browser_window.pageYOffset,
			e_: _Browser_doc.documentElement.clientWidth,
			d0: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		e_: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		d0: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			eD: {
				e_: node.scrollWidth,
				d0: node.scrollHeight
			},
			eZ: {
				c_: node.scrollLeft,
				c$: node.scrollTop,
				e_: node.clientWidth,
				d0: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			eD: _Browser_getScene(),
			eZ: {
				c_: x,
				c$: y,
				e_: _Browser_doc.documentElement.clientWidth,
				d0: _Browser_doc.documentElement.clientHeight
			},
			fa: {
				c_: x + rect.left,
				c$: y + rect.top,
				e_: rect.width,
				d0: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.N.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.N.b, xhr)); });
		$elm$core$Maybe$isJust(request.aL) && _Http_track(router, xhr, request.aL.a);

		try {
			xhr.open(request.aB, request.V, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.V));
		}

		_Http_configureRequest(xhr, request);

		request.K.a && xhr.setRequestHeader('Content-Type', request.K.a);
		xhr.send(request.K.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.au; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.aK.a || 0;
	xhr.responseType = request.N.d;
	xhr.withCredentials = request.e1;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		V: xhr.responseURL,
		fw: xhr.status,
		fx: xhr.statusText,
		au: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			fv: event.loaded,
			eG: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			ft: event.loaded,
			eG: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}


function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}


// CREATE

var _Regex_never = /.^/;

var _Regex_fromStringWith = F2(function(options, string)
{
	var flags = 'g';
	if (options.fm) { flags += 'm'; }
	if (options.e3) { flags += 'i'; }

	try
	{
		return $elm$core$Maybe$Just(new RegExp(string, flags));
	}
	catch(error)
	{
		return $elm$core$Maybe$Nothing;
	}
});


// USE

var _Regex_contains = F2(function(re, string)
{
	return string.match(re) !== null;
});


var _Regex_findAtMost = F3(function(n, re, str)
{
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex == re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		out.push(A4($elm$regex$Regex$Match, result[0], result.index, number, _List_fromArray(subs)));
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _List_fromArray(out);
});


var _Regex_replaceAtMost = F4(function(n, re, replacer, string)
{
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		return replacer(A4($elm$regex$Regex$Match, match, arguments[arguments.length - 2], count, _List_fromArray(submatches)));
	}
	return string.replace(re, jsReplacer);
});

var _Regex_splitAtMost = F3(function(n, re, str)
{
	var string = str;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		var result = re.exec(string);
		if (!result) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _List_fromArray(out);
});

var _Regex_infinity = Infinity;



// DECODER

var _File_decoder = _Json_decodePrim(function(value) {
	// NOTE: checks if `File` exists in case this is run on node
	return (typeof File !== 'undefined' && value instanceof File)
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FILE', value);
});


// METADATA

function _File_name(file) { return file.name; }
function _File_mime(file) { return file.type; }
function _File_size(file) { return file.size; }

function _File_lastModified(file)
{
	return $elm$time$Time$millisToPosix(file.lastModified);
}


// DOWNLOAD

var _File_downloadNode;

function _File_getDownloadNode()
{
	return _File_downloadNode || (_File_downloadNode = document.createElement('a'));
}

var _File_download = F3(function(name, mime, content)
{
	return _Scheduler_binding(function(callback)
	{
		var blob = new Blob([content], {type: mime});

		// for IE10+
		if (navigator.msSaveOrOpenBlob)
		{
			navigator.msSaveOrOpenBlob(blob, name);
			return;
		}

		// for HTML5
		var node = _File_getDownloadNode();
		var objectUrl = URL.createObjectURL(blob);
		node.href = objectUrl;
		node.download = name;
		_File_click(node);
		URL.revokeObjectURL(objectUrl);
	});
});

function _File_downloadUrl(href)
{
	return _Scheduler_binding(function(callback)
	{
		var node = _File_getDownloadNode();
		node.href = href;
		node.download = '';
		node.origin === location.origin || (node.target = '_blank');
		_File_click(node);
	});
}


// IE COMPATIBILITY

function _File_makeBytesSafeForInternetExplorer(bytes)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/10
	// all other browsers can just run `new Blob([bytes])` directly with no problem
	//
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function _File_click(node)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/11
	// all other browsers have MouseEvent and do not need this conditional stuff
	//
	if (typeof MouseEvent === 'function')
	{
		node.dispatchEvent(new MouseEvent('click'));
	}
	else
	{
		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		document.body.appendChild(node);
		node.dispatchEvent(event);
		document.body.removeChild(node);
	}
}


// UPLOAD

var _File_node;

function _File_uploadOne(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			callback(_Scheduler_succeed(event.target.files[0]));
		});
		_File_click(_File_node);
	});
}

function _File_uploadOneOrMore(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.multiple = true;
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			var elmFiles = _List_fromArray(event.target.files);
			callback(_Scheduler_succeed(_Utils_Tuple2(elmFiles.a, elmFiles.b)));
		});
		_File_click(_File_node);
	});
}


// CONTENT

function _File_toString(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsText(blob);
		return function() { reader.abort(); };
	});
}

function _File_toBytes(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(new DataView(reader.result)));
		});
		reader.readAsArrayBuffer(blob);
		return function() { reader.abort(); };
	});
}

function _File_toUrl(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsDataURL(blob);
		return function() { reader.abort(); };
	});
}




var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});




// STRINGS


var _Parser_isSubString = F5(function(smallString, offset, row, col, bigString)
{
	var smallLength = smallString.length;
	var isGood = offset + smallLength <= bigString.length;

	for (var i = 0; isGood && i < smallLength; )
	{
		var code = bigString.charCodeAt(offset);
		isGood =
			smallString[i++] === bigString[offset++]
			&& (
				code === 0x000A /* \n */
					? ( row++, col=1 )
					: ( col++, (code & 0xF800) === 0xD800 ? smallString[i++] === bigString[offset++] : 1 )
			)
	}

	return _Utils_Tuple3(isGood ? offset : -1, row, col);
});



// CHARS


var _Parser_isSubChar = F3(function(predicate, offset, string)
{
	return (
		string.length <= offset
			? -1
			:
		(string.charCodeAt(offset) & 0xF800) === 0xD800
			? (predicate(_Utils_chr(string.substr(offset, 2))) ? offset + 2 : -1)
			:
		(predicate(_Utils_chr(string[offset]))
			? ((string[offset] === '\n') ? -2 : (offset + 1))
			: -1
		)
	);
});


var _Parser_isAsciiCode = F3(function(code, offset, string)
{
	return string.charCodeAt(offset) === code;
});



// NUMBERS


var _Parser_chompBase10 = F2(function(offset, string)
{
	for (; offset < string.length; offset++)
	{
		var code = string.charCodeAt(offset);
		if (code < 0x30 || 0x39 < code)
		{
			return offset;
		}
	}
	return offset;
});


var _Parser_consumeBase = F3(function(base, offset, string)
{
	for (var total = 0; offset < string.length; offset++)
	{
		var digit = string.charCodeAt(offset) - 0x30;
		if (digit < 0 || base <= digit) break;
		total = base * total + digit;
	}
	return _Utils_Tuple2(offset, total);
});


var _Parser_consumeBase16 = F2(function(offset, string)
{
	for (var total = 0; offset < string.length; offset++)
	{
		var code = string.charCodeAt(offset);
		if (0x30 <= code && code <= 0x39)
		{
			total = 16 * total + code - 0x30;
		}
		else if (0x41 <= code && code <= 0x46)
		{
			total = 16 * total + code - 55;
		}
		else if (0x61 <= code && code <= 0x66)
		{
			total = 16 * total + code - 87;
		}
		else
		{
			break;
		}
	}
	return _Utils_Tuple2(offset, total);
});



// FIND STRING


var _Parser_findSubString = F5(function(smallString, offset, row, col, bigString)
{
	var newOffset = bigString.indexOf(smallString, offset);
	var target = newOffset < 0 ? bigString.length : newOffset + smallString.length;

	while (offset < target)
	{
		var code = bigString.charCodeAt(offset++);
		code === 0x000A /* \n */
			? ( col=1, row++ )
			: ( col++, (code & 0xF800) === 0xD800 && offset++ )
	}

	return _Utils_Tuple3(newOffset, row, col);
});
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.k) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.m),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.m);
		} else {
			var treeLen = builder.k * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.o) : builder.o;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.k);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.m) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.m);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{o: nodeList, k: (len / $elm$core$Array$branchFactor) | 0, m: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {d$: fragment, d2: host, el: path, en: port_, es: protocol, cC: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Main$GotExposition = function (a) {
	return {$: 9, a: a};
};
var $author$project$Main$NavbarMsg = function (a) {
	return {$: 27, a: a};
};
var $author$project$Problems$WrongExpositionUrl = {$: 0};
var $rundis$elm_bootstrap$Bootstrap$Alert$Shown = 0;
var $rundis$elm_bootstrap$Bootstrap$Alert$shown = 0;
var $author$project$Main$addProblem = F2(
	function (model, problem) {
		return _Utils_update(
			model,
			{
				am: $rundis$elm_bootstrap$Bootstrap$Alert$shown,
				H: A2($elm$core$List$cons, problem, model.H)
			});
	});
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $author$project$Main$Flags = F2(
	function (weave, research) {
		return {s: research, aO: weave};
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Main$decodeFlags = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Main$Flags,
	A2($elm$json$Json$Decode$field, 'weave', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'research', $elm$json$Json$Decode$int));
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $author$project$Main$CodemirrorMarkdown = 0;
var $author$project$Main$EditorMarkdown = 0;
var $author$project$Main$Ready = {$: 0};
var $rundis$elm_bootstrap$Bootstrap$Alert$Closed = 3;
var $rundis$elm_bootstrap$Bootstrap$Alert$closed = 3;
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $author$project$Settings$editorVersion = '2.1.0';
var $author$project$Exposition$empty = {dK: _List_Nil, bP: 0, c4: '', dR: 0, dV: $author$project$Settings$editorVersion, j: 0, a7: '', n: _List_Nil, cF: '', dC: '', dD: _List_Nil};
var $rundis$elm_bootstrap$Bootstrap$Modal$Hide = 3;
var $rundis$elm_bootstrap$Bootstrap$Modal$hidden = 3;
var $author$project$RCMediaEdit$empty = {bB: false, eg: $elm$core$Maybe$Nothing, eh: $elm$core$Maybe$Nothing, cZ: $rundis$elm_bootstrap$Bootstrap$Modal$hidden};
var $billstclair$elm_sortable_table$Table$State = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $billstclair$elm_sortable_table$Table$initialSort = function (header) {
	return A2($billstclair$elm_sortable_table$Table$State, header, false);
};
var $author$project$RCMediaList$empty = {
	aF: $elm$core$Maybe$Nothing,
	cC: '',
	cM: $billstclair$elm_sortable_table$Table$initialSort('ID')
};
var $author$project$UserConfirm$empty = {e0: $elm$core$Maybe$Nothing, c2: $elm$core$Maybe$Nothing, cZ: $rundis$elm_bootstrap$Bootstrap$Modal$hidden};
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$Area = F4(
	function (top, left, width, height) {
		return {d0: height, ac: left, aj: top, e_: width};
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$Closed = 2;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$State = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$initialState = {
	a9: A4($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$Area, 0, 0, 0, 0),
	eJ: 2,
	cP: A4($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$Area, 0, 0, 0, 0)
};
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $author$project$Main$emptyModel = F3(
	function (navbarInitState, research, weave) {
		return {
			am: $rundis$elm_bootstrap$Bootstrap$Alert$closed,
			aq: $author$project$UserConfirm$empty,
			aY: _Utils_Tuple2(-1, -1),
			p: _Utils_Tuple2(0, 0),
			aZ: $rundis$elm_bootstrap$Bootstrap$Dropdown$initialState,
			b: $author$project$Exposition$empty,
			bV: false,
			a1: $author$project$Main$Ready,
			ae: $elm$core$Dict$empty,
			D: $author$project$RCMediaEdit$empty,
			a8: $author$project$RCMediaList$empty,
			r: _Utils_Tuple2($author$project$RCMediaList$empty, $rundis$elm_bootstrap$Bootstrap$Modal$hidden),
			aA: $author$project$Main$Ready,
			bb: navbarInitState,
			H: _List_Nil,
			s: research,
			R: true,
			aO: weave
		};
	});
var $author$project$RCAPI$APIAdditionalMediaMetadata = F3(
	function (id, name, userClass) {
		return {j: id, l: name, W: userClass};
	});
var $elm$json$Json$Decode$map3 = _Json_map3;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$RCAPI$apiAdditionalMediaMetadata = A4(
	$elm$json$Json$Decode$map3,
	$author$project$RCAPI$APIAdditionalMediaMetadata,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string)),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'userClass', $elm$json$Json$Decode$string)));
var $author$project$RCAPI$APIExpositionMetadata = F2(
	function (editorVersion, contentVersion) {
		return {bP: contentVersion, dV: editorVersion};
	});
var $author$project$RCAPI$apiExpositionMetadata = A3(
	$elm$json$Json$Decode$map2,
	$author$project$RCAPI$APIExpositionMetadata,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'editorversion', $elm$json$Json$Decode$string),
				A2($elm$json$Json$Decode$field, 'editorVersion', $elm$json$Json$Decode$string)
			])),
	A2($elm$json$Json$Decode$field, 'contentVersion', $elm$json$Json$Decode$int));
var $author$project$RCAPI$Left = function (a) {
	return {$: 0, a: a};
};
var $author$project$RCAPI$eitherString = A2($elm$json$Json$Decode$map, $author$project$RCAPI$Left, $elm$json$Json$Decode$string);
var $elm$json$Json$Decode$list = _Json_decodeList;
var $elm$json$Json$Decode$map6 = _Json_map6;
var $author$project$RCAPI$APIExposition = F6(
	function (html, markdown, media, metadata, style, title) {
		return {da: html, fk: markdown, n: media, ca: metadata, eK: style, dC: title};
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$RCAPI$mkExposition = F6(
	function (html, md, media, meta, style, title) {
		return A6(
			$author$project$RCAPI$APIExposition,
			A2($elm$core$Maybe$withDefault, '', html),
			A2($elm$core$Maybe$withDefault, '', md),
			media,
			meta,
			A2($elm$core$Maybe$withDefault, '', style),
			title);
	});
var $author$project$RCAPI$Right = function (a) {
	return {$: 1, a: a};
};
var $author$project$RCAPI$rightDecoder = function (decoder) {
	return A2($elm$json$Json$Decode$map, $author$project$RCAPI$Right, decoder);
};
var $author$project$RCAPI$apiExposition = A7(
	$elm$json$Json$Decode$map6,
	$author$project$RCAPI$mkExposition,
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'html', $elm$json$Json$Decode$string)),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'markdown', $elm$json$Json$Decode$string)),
	A2(
		$elm$json$Json$Decode$field,
		'media',
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					$author$project$RCAPI$eitherString,
					$author$project$RCAPI$rightDecoder(
					$elm$json$Json$Decode$list($author$project$RCAPI$apiAdditionalMediaMetadata))
				]))),
	A2(
		$elm$json$Json$Decode$field,
		'metadata',
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					$author$project$RCAPI$eitherString,
					$author$project$RCAPI$rightDecoder($author$project$RCAPI$apiExpositionMetadata)
				]))),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'style', $elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string));
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm$http$Http$BadBody = function (a) {
	return {$: 4, a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 3, a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$NetworkError = {$: 2};
var $elm$http$Http$Timeout = {$: 1};
var $elm$http$Http$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 0:
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 1:
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 2:
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 3:
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.fw));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			$elm$http$Http$resolve(
				function (string) {
					return A2(
						$elm$core$Result$mapError,
						$elm$json$Json$Decode$errorToString,
						A2($elm$json$Json$Decode$decodeString, decoder, string));
				}));
	});
var $elm$http$Http$Header = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$header = $elm$http$Http$Header;
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {ew: reqs, eL: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.aL;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.ew));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.eL)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					e1: r.e1,
					K: r.K,
					N: A2(_Http_mapExpect, func, r.N),
					au: r.au,
					aB: r.aB,
					aK: r.aK,
					aL: r.aL,
					V: r.V
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{e1: false, K: r.K, N: r.N, au: r.au, aB: r.aB, aK: r.aK, aL: r.aL, V: r.V}));
};
var $author$project$RCAPI$getExposition = F3(
	function (researchId, weave, msg) {
		return $elm$http$Http$request(
			{
				K: $elm$http$Http$emptyBody,
				N: A2($elm$http$Http$expectJson, msg, $author$project$RCAPI$apiExposition),
				au: _List_fromArray(
					[
						A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
					]),
				aB: 'GET',
				aK: $elm$core$Maybe$Nothing,
				aL: $elm$core$Maybe$Nothing,
				V: 'text-editor/load?research=' + ($elm$core$String$fromInt(researchId) + ('&weave=' + $elm$core$String$fromInt(weave)))
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$Hidden = 0;
var $rundis$elm_bootstrap$Bootstrap$Navbar$State = $elm$core$Basics$identity;
var $elm$browser$Browser$Dom$getViewport = _Browser_withWindow(_Browser_getViewport);
var $rundis$elm_bootstrap$Bootstrap$Navbar$mapState = F2(
	function (mapper, _v0) {
		var state = _v0;
		return mapper(state);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$initWindowSize = F2(
	function (toMsg, state) {
		return A2(
			$elm$core$Task$perform,
			function (vp) {
				return toMsg(
					A2(
						$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
						function (s) {
							return _Utils_update(
								s,
								{
									bs: $elm$core$Maybe$Just(vp.eZ.e_)
								});
						},
						state));
			},
			$elm$browser$Browser$Dom$getViewport);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$initialState = function (toMsg) {
	var state = {_: $elm$core$Dict$empty, d0: $elm$core$Maybe$Nothing, cZ: 0, bs: $elm$core$Maybe$Nothing};
	return _Utils_Tuple2(
		state,
		A2($rundis$elm_bootstrap$Bootstrap$Navbar$initWindowSize, toMsg, state));
};
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$init = function (flags) {
	var _v0 = $rundis$elm_bootstrap$Bootstrap$Navbar$initialState($author$project$Main$NavbarMsg);
	var navbarState = _v0.a;
	var navCmd = _v0.b;
	var _v1 = A2($elm$json$Json$Decode$decodeValue, $author$project$Main$decodeFlags, flags);
	if (!_v1.$) {
		var fl = _v1.a;
		return _Utils_Tuple2(
			A3($author$project$Main$emptyModel, navbarState, fl.s, fl.aO),
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						navCmd,
						A3($author$project$RCAPI$getExposition, fl.s, fl.aO, $author$project$Main$GotExposition)
					])));
	} else {
		return _Utils_Tuple2(
			A2(
				$author$project$Main$addProblem,
				A3($author$project$Main$emptyModel, navbarState, -1, -1),
				$author$project$Problems$WrongExpositionUrl),
			$elm$core$Platform$Cmd$none);
	}
};
var $author$project$Main$CMOpenMediaDialog = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$EditGeneration = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$ExportDropMsg = function (a) {
	return {$: 40, a: a};
};
var $author$project$Main$GotConvertedHtml = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$GotImportUploadProgress = function (a) {
	return {$: 17, a: a};
};
var $author$project$Main$GotMediaUploadProgress = function (a) {
	return {$: 16, a: a};
};
var $author$project$Main$MdContent = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$SaveExposition = {$: 20};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Main$cmContent = _Platform_incomingPort('cmContent', $elm$json$Json$Decode$value);
var $author$project$Main$currentGeneration = _Platform_incomingPort('currentGeneration', $elm$json$Json$Decode$value);
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {er: processes, eN: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.er;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.eN);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$index = _Json_decodeIndex;
var $author$project$Main$getHtml = _Platform_incomingPort(
	'getHtml',
	A2(
		$elm$json$Json$Decode$andThen,
		function (toc) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (html) {
					return $elm$json$Json$Decode$succeed(
						{da: html, dD: toc});
				},
				A2($elm$json$Json$Decode$field, 'html', $elm$json$Json$Decode$string));
		},
		A2(
			$elm$json$Json$Decode$field,
			'toc',
			$elm$json$Json$Decode$list(
				A2(
					$elm$json$Json$Decode$andThen,
					function (_v0) {
						return A2(
							$elm$json$Json$Decode$andThen,
							function (_v1) {
								return A2(
									$elm$json$Json$Decode$andThen,
									function (_v2) {
										return $elm$json$Json$Decode$succeed(
											_Utils_Tuple3(_v0, _v1, _v2));
									},
									A2($elm$json$Json$Decode$index, 2, $elm$json$Json$Decode$string));
							},
							A2($elm$json$Json$Decode$index, 1, $elm$json$Json$Decode$string));
					},
					A2($elm$json$Json$Decode$index, 0, $elm$json$Json$Decode$string))))));
var $author$project$Main$mediaDialog = _Platform_incomingPort('mediaDialog', $elm$json$Json$Decode$value);
var $rundis$elm_bootstrap$Bootstrap$Dropdown$ListenClicks = 1;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$AnimationManager$Time = function (a) {
	return {$: 0, a: a};
};
var $elm$browser$Browser$AnimationManager$State = F3(
	function (subs, request, oldTime) {
		return {di: oldTime, ex: request, eL: subs};
	});
var $elm$browser$Browser$AnimationManager$init = $elm$core$Task$succeed(
	A3($elm$browser$Browser$AnimationManager$State, _List_Nil, $elm$core$Maybe$Nothing, 0));
var $elm$browser$Browser$AnimationManager$now = _Browser_now(0);
var $elm$browser$Browser$AnimationManager$rAF = _Browser_rAF(0);
var $elm$browser$Browser$AnimationManager$onEffects = F3(
	function (router, subs, _v0) {
		var request = _v0.ex;
		var oldTime = _v0.di;
		var _v1 = _Utils_Tuple2(request, subs);
		if (_v1.a.$ === 1) {
			if (!_v1.b.b) {
				var _v2 = _v1.a;
				return $elm$browser$Browser$AnimationManager$init;
			} else {
				var _v4 = _v1.a;
				return A2(
					$elm$core$Task$andThen,
					function (pid) {
						return A2(
							$elm$core$Task$andThen,
							function (time) {
								return $elm$core$Task$succeed(
									A3(
										$elm$browser$Browser$AnimationManager$State,
										subs,
										$elm$core$Maybe$Just(pid),
										time));
							},
							$elm$browser$Browser$AnimationManager$now);
					},
					$elm$core$Process$spawn(
						A2(
							$elm$core$Task$andThen,
							$elm$core$Platform$sendToSelf(router),
							$elm$browser$Browser$AnimationManager$rAF)));
			}
		} else {
			if (!_v1.b.b) {
				var pid = _v1.a.a;
				return A2(
					$elm$core$Task$andThen,
					function (_v3) {
						return $elm$browser$Browser$AnimationManager$init;
					},
					$elm$core$Process$kill(pid));
			} else {
				return $elm$core$Task$succeed(
					A3($elm$browser$Browser$AnimationManager$State, subs, request, oldTime));
			}
		}
	});
var $elm$browser$Browser$AnimationManager$onSelfMsg = F3(
	function (router, newTime, _v0) {
		var subs = _v0.eL;
		var oldTime = _v0.di;
		var send = function (sub) {
			if (!sub.$) {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(
						$elm$time$Time$millisToPosix(newTime)));
			} else {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(newTime - oldTime));
			}
		};
		return A2(
			$elm$core$Task$andThen,
			function (pid) {
				return A2(
					$elm$core$Task$andThen,
					function (_v1) {
						return $elm$core$Task$succeed(
							A3(
								$elm$browser$Browser$AnimationManager$State,
								subs,
								$elm$core$Maybe$Just(pid),
								newTime));
					},
					$elm$core$Task$sequence(
						A2($elm$core$List$map, send, subs)));
			},
			$elm$core$Process$spawn(
				A2(
					$elm$core$Task$andThen,
					$elm$core$Platform$sendToSelf(router),
					$elm$browser$Browser$AnimationManager$rAF)));
	});
var $elm$browser$Browser$AnimationManager$Delta = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$AnimationManager$subMap = F2(
	function (func, sub) {
		if (!sub.$) {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Time(
				A2($elm$core$Basics$composeL, func, tagger));
		} else {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Delta(
				A2($elm$core$Basics$composeL, func, tagger));
		}
	});
_Platform_effectManagers['Browser.AnimationManager'] = _Platform_createManager($elm$browser$Browser$AnimationManager$init, $elm$browser$Browser$AnimationManager$onEffects, $elm$browser$Browser$AnimationManager$onSelfMsg, 0, $elm$browser$Browser$AnimationManager$subMap);
var $elm$browser$Browser$AnimationManager$subscription = _Platform_leaf('Browser.AnimationManager');
var $elm$browser$Browser$AnimationManager$onAnimationFrame = function (tagger) {
	return $elm$browser$Browser$AnimationManager$subscription(
		$elm$browser$Browser$AnimationManager$Time(tagger));
};
var $elm$browser$Browser$Events$onAnimationFrame = $elm$browser$Browser$AnimationManager$onAnimationFrame;
var $elm$browser$Browser$Events$Document = 0;
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {em: pids, eL: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {dY: event, eb: key};
	});
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.em,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.eb;
		var event = _v0.dY;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.eL);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onClick = A2($elm$browser$Browser$Events$on, 0, 'click');
var $rundis$elm_bootstrap$Bootstrap$Dropdown$updateStatus = F2(
	function (status, _v0) {
		var stateRec = _v0;
		return _Utils_update(
			stateRec,
			{eJ: status});
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$subscriptions = F2(
	function (state, toMsg) {
		var status = state.eJ;
		switch (status) {
			case 0:
				return $elm$browser$Browser$Events$onAnimationFrame(
					function (_v1) {
						return toMsg(
							A2($rundis$elm_bootstrap$Bootstrap$Dropdown$updateStatus, 1, state));
					});
			case 1:
				return $elm$browser$Browser$Events$onClick(
					$elm$json$Json$Decode$succeed(
						toMsg(
							A2($rundis$elm_bootstrap$Bootstrap$Dropdown$updateStatus, 2, state))));
			default:
				return $elm$core$Platform$Sub$none;
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$AnimatingDown = 2;
var $rundis$elm_bootstrap$Bootstrap$Navbar$AnimatingUp = 4;
var $rundis$elm_bootstrap$Bootstrap$Navbar$Closed = 2;
var $rundis$elm_bootstrap$Bootstrap$Navbar$ListenClicks = 1;
var $rundis$elm_bootstrap$Bootstrap$Navbar$Open = 0;
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$Dict$map = F2(
	function (func, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				A2(func, key, value),
				A2($elm$core$Dict$map, func, left),
				A2($elm$core$Dict$map, func, right));
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$dropdownSubscriptions = F2(
	function (state, toMsg) {
		var dropdowns = state._;
		var updDropdowns = A2(
			$elm$core$Dict$map,
			F2(
				function (_v2, status) {
					switch (status) {
						case 0:
							return 1;
						case 1:
							return 2;
						default:
							return 2;
					}
				}),
			dropdowns);
		var updState = A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
			function (s) {
				return _Utils_update(
					s,
					{_: updDropdowns});
			},
			state);
		var needsSub = function (s) {
			return A2(
				$elm$core$List$any,
				function (_v1) {
					var status = _v1.b;
					return _Utils_eq(status, s);
				},
				$elm$core$Dict$toList(dropdowns));
		};
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					needsSub(0) ? $elm$browser$Browser$Events$onAnimationFrame(
					function (_v0) {
						return toMsg(updState);
					}) : $elm$core$Platform$Sub$none,
					needsSub(1) ? $elm$browser$Browser$Events$onClick(
					$elm$json$Json$Decode$succeed(
						toMsg(updState))) : $elm$core$Platform$Sub$none
				]));
	});
var $elm$browser$Browser$Events$Window = 1;
var $elm$browser$Browser$Events$onResize = function (func) {
	return A3(
		$elm$browser$Browser$Events$on,
		1,
		'resize',
		A2(
			$elm$json$Json$Decode$field,
			'target',
			A3(
				$elm$json$Json$Decode$map2,
				func,
				A2($elm$json$Json$Decode$field, 'innerWidth', $elm$json$Json$Decode$int),
				A2($elm$json$Json$Decode$field, 'innerHeight', $elm$json$Json$Decode$int))));
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$subscriptions = F2(
	function (state, toMsg) {
		var visibility = state.cZ;
		var updState = function (v) {
			return A2(
				$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
				function (s) {
					return _Utils_update(
						s,
						{cZ: v});
				},
				state);
		};
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					function () {
					switch (visibility) {
						case 1:
							return $elm$browser$Browser$Events$onAnimationFrame(
								function (_v1) {
									return toMsg(
										updState(2));
								});
						case 3:
							return $elm$browser$Browser$Events$onAnimationFrame(
								function (_v2) {
									return toMsg(
										updState(4));
								});
						default:
							return $elm$core$Platform$Sub$none;
					}
				}(),
					$elm$browser$Browser$Events$onResize(
					F2(
						function (x, _v3) {
							return toMsg(
								A2(
									$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
									function (s) {
										return _Utils_update(
											s,
											{
												bs: $elm$core$Maybe$Just(x)
											});
									},
									state));
						})),
					A2($rundis$elm_bootstrap$Bootstrap$Navbar$dropdownSubscriptions, state, toMsg)
				]));
	});
var $elm$http$Http$track = F2(
	function (tracker, toMsg) {
		return $elm$http$Http$subscription(
			A2($elm$http$Http$MySub, tracker, toMsg));
	});
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Main$currentGeneration($author$project$Main$EditGeneration),
				$author$project$Main$cmContent($author$project$Main$MdContent),
				$author$project$Main$getHtml($author$project$Main$GotConvertedHtml),
				$author$project$Main$mediaDialog($author$project$Main$CMOpenMediaDialog),
				A2($elm$http$Http$track, 'uploadMedia', $author$project$Main$GotMediaUploadProgress),
				A2($elm$http$Http$track, 'uploadImport', $author$project$Main$GotImportUploadProgress),
				A2($rundis$elm_bootstrap$Bootstrap$Dropdown$subscriptions, model.aZ, $author$project$Main$ExportDropMsg),
				A2(
				$elm$time$Time$every,
				10000,
				function (_v0) {
					return $author$project$Main$SaveExposition;
				}),
				A2($rundis$elm_bootstrap$Bootstrap$Navbar$subscriptions, model.bb, $author$project$Main$NavbarMsg)
			]));
};
var $author$project$Main$BadUploadFileType = function (a) {
	return {$: 41, a: a};
};
var $author$project$Problems$CannotFindMediaFieldInJson = {$: 5};
var $author$project$Problems$CannotImportFile = function (a) {
	return {$: 6, a: a};
};
var $author$project$Problems$CannotLoadExposition = function (a) {
	return {$: 12, a: a};
};
var $author$project$Problems$CannotLoadMedia = function (a) {
	return {$: 1, a: a};
};
var $author$project$Problems$CannotSave = {$: 3};
var $author$project$Problems$CannotUpdateMedia = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$CloseConfirmDialog = {$: 25};
var $author$project$Problems$DecodingJsonError = function (a) {
	return {$: 11, a: a};
};
var $author$project$Main$DownloadExport = F2(
	function (a, b) {
		return {$: 32, a: a, b: b};
	});
var $author$project$Problems$ExportFailed = {$: 10};
var $author$project$Problems$FootnoteHelperError = function (a) {
	return {$: 14, a: a};
};
var $author$project$Main$GotMediaList = function (a) {
	return {$: 10, a: a};
};
var $author$project$Main$MediaDeleted = function (a) {
	return {$: 28, a: a};
};
var $author$project$Main$MediaDialog = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $author$project$Problems$MediaUploadFailed = function (a) {
	return {$: 8, a: a};
};
var $author$project$Problems$MediaUserClassesProblem = {$: 15};
var $author$project$Problems$NoMediaWithNameOrId = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$OpenNewMediaGotMediaList = F2(
	function (a, b) {
		return {$: 11, a: a, b: b};
	});
var $author$project$Main$SavedExposition = function (a) {
	return {$: 21, a: a};
};
var $author$project$Main$SavedMediaEdit = function (a) {
	return {$: 23, a: a};
};
var $author$project$Problems$UnkownUploadFileType = function (a) {
	return {$: 7, a: a};
};
var $author$project$Problems$UnsupportedMessage = function (a) {
	return {$: 16, a: a};
};
var $author$project$Main$UploadImportFileSelected = function (a) {
	return {$: 15, a: a};
};
var $author$project$Main$UploadMediaFileSelected = function (a) {
	return {$: 13, a: a};
};
var $author$project$Main$Uploaded = function (a) {
	return {$: 18, a: a};
};
var $author$project$Main$UploadedImport = function (a) {
	return {$: 19, a: a};
};
var $author$project$Main$Uploading = function (a) {
	return {$: 1, a: a};
};
var $author$project$Exposition$addMediaUserClasses = F2(
	function (expo, classesDict) {
		var mediaWithClasses = A2(
			$elm$core$List$map,
			function (m) {
				var _v0 = A2($elm$core$Dict$get, m.j, classesDict);
				if (_v0.$ === 1) {
					return m;
				} else {
					var _class = _v0.a;
					return _Utils_update(
						m,
						{W: _class});
				}
			},
			expo.n);
		return _Utils_update(
			expo,
			{n: mediaWithClasses});
	});
var $author$project$Exposition$addObject = F2(
	function (obj, exp) {
		return _Utils_update(
			exp,
			{
				n: A2($elm$core$List$cons, obj, exp.n)
			});
	});
var $author$project$Exposition$replaceObject = F2(
	function (obj, exp) {
		return _Utils_update(
			exp,
			{
				n: A2(
					$elm$core$List$map,
					function (m) {
						return _Utils_eq(m.j, obj.j) ? obj : m;
					},
					exp.n)
			});
	});
var $author$project$Exposition$addOrReplaceObject = F2(
	function (obj, exp) {
		return A2(
			$elm$core$List$any,
			function (m) {
				return _Utils_eq(m.j, obj.j);
			},
			exp.n) ? A2($author$project$Exposition$replaceObject, obj, exp) : A2($author$project$Exposition$addObject, obj, exp);
	});
var $author$project$Main$addProblems = F2(
	function (model, problems) {
		return _Utils_update(
			model,
			{
				am: $rundis$elm_bootstrap$Bootstrap$Alert$shown,
				H: _Utils_ap(problems, model.H)
			});
	});
var $author$project$RCAPI$APIMedia = F4(
	function (mediaType, status, width, height) {
		return {d0: height, b8: mediaType, eJ: status, e_: width};
	});
var $elm$json$Json$Decode$map4 = _Json_map4;
var $author$project$RCAPI$apiMedia = A5(
	$elm$json$Json$Decode$map4,
	$author$project$RCAPI$APIMedia,
	A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'status', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'width', $elm$json$Json$Decode$int)),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'height', $elm$json$Json$Decode$int)));
var $author$project$RCAPI$APIMediaEntry = F6(
	function (id, media, description, copyright, name, license) {
		return {aU: copyright, aW: description, j: id, b5: license, n: media, l: name};
	});
var $author$project$Licenses$AllRightsReserved = 0;
var $author$project$Util$find = F2(
	function (predicate, list) {
		find:
		while (true) {
			if (!list.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var first = list.a;
				var rest = list.b;
				if (predicate(first)) {
					return $elm$core$Maybe$Just(first);
				} else {
					var $temp$predicate = predicate,
						$temp$list = rest;
					predicate = $temp$predicate;
					list = $temp$list;
					continue find;
				}
			}
		}
	});
var $author$project$Util$fst = function (_v0) {
	var a = _v0.a;
	var b = _v0.b;
	return a;
};
var $author$project$Licenses$CCBY = 1;
var $author$project$Licenses$CCBYNC = 3;
var $author$project$Licenses$CCBYNCND = 5;
var $author$project$Licenses$CCBYNCSA = 4;
var $author$project$Licenses$CCBYSA = 2;
var $author$project$Licenses$PublicDomain = 6;
var $author$project$Licenses$licensesDict = _List_fromArray(
	[
		_Utils_Tuple2(0, 'all-rights-reserved'),
		_Utils_Tuple2(1, 'cc-by'),
		_Utils_Tuple2(2, 'cc-by-sa'),
		_Utils_Tuple2(3, 'cc-by-nc'),
		_Utils_Tuple2(4, 'cc-by-nc-sa'),
		_Utils_Tuple2(5, 'cc-by-nc-nd'),
		_Utils_Tuple2(6, 'public-domain')
	]);
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Licenses$fromString = function (s) {
	return A2(
		$elm$core$Maybe$withDefault,
		0,
		A2(
			$elm$core$Maybe$map,
			$author$project$Util$fst,
			A2(
				$author$project$Util$find,
				function (_v0) {
					var str = _v0.b;
					return _Utils_eq(str, s);
				},
				$author$project$Licenses$licensesDict)));
};
var $author$project$RCAPI$mkMediaEntry = F6(
	function (id, media, description, copyright, name, license) {
		return A6(
			$author$project$RCAPI$APIMediaEntry,
			id,
			media,
			A2($elm$core$Maybe$withDefault, '', description),
			A2($elm$core$Maybe$withDefault, '', copyright),
			name,
			$author$project$Licenses$fromString(
				A2($elm$core$Maybe$withDefault, '', license)));
	});
var $author$project$RCAPI$apiMediaEntry = A7(
	$elm$json$Json$Decode$map6,
	$author$project$RCAPI$mkMediaEntry,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'media', $author$project$RCAPI$apiMedia),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'description', $elm$json$Json$Decode$string)),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'copyright', $elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'license', $elm$json$Json$Decode$string)));
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Main$cmRedo = _Platform_outgoingPort(
	'cmRedo',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$cmUndo = _Platform_outgoingPort(
	'cmUndo',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$MediaDelete = function (a) {
	return {$: 7, a: a};
};
var $author$project$UserConfirm$Model = F3(
	function (visibility, content, actions) {
		return {e0: actions, c2: content, cZ: visibility};
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$Show = 0;
var $rundis$elm_bootstrap$Bootstrap$Modal$shown = 0;
var $author$project$Main$confirmObjectDelete = function (object) {
	var messages = $elm$core$Maybe$Just(
		{
			dQ: $author$project$Main$MediaDelete(object),
			eu: $author$project$Main$CloseConfirmDialog
		});
	var content = $elm$core$Maybe$Just(
		{dQ: 'Delete', fs: object.l + ' is about to be deleted. Are you sure?', eu: 'Keep'});
	return A3($author$project$UserConfirm$Model, $rundis$elm_bootstrap$Bootstrap$Modal$shown, content, messages);
};
var $author$project$Settings$baseDomain = 'https://www.researchcatalogue.net';
var $elm$http$Http$expectBytesResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'arraybuffer',
			_Http_toDataView,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$multipartBody = function (parts) {
	return A2(
		_Http_pair,
		'',
		_Http_toFormData(parts));
};
var $elm$http$Http$post = function (r) {
	return $elm$http$Http$request(
		{K: r.K, N: r.N, au: _List_Nil, aB: 'POST', aK: $elm$core$Maybe$Nothing, aL: $elm$core$Maybe$Nothing, V: r.V});
};
var $elm$regex$Regex$Match = F4(
	function (match, index, number, submatches) {
		return {ff: index, fl: match, fn: number, cN: submatches};
	});
var $elm$regex$Regex$fromStringWith = _Regex_fromStringWith;
var $elm$regex$Regex$fromString = function (string) {
	return A2(
		$elm$regex$Regex$fromStringWith,
		{e3: false, fm: false},
		string);
};
var $author$project$Exposition$mediaUrl = function (data) {
	return '/text-editor/simple-media-resource?research=' + ($elm$core$String$fromInt(data.bU) + ('&simple-media=' + $elm$core$String$fromInt(data.j)));
};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Exposition$objectByNameOrId = F2(
	function (nameOrId, exp) {
		var _v0 = $elm$core$String$toInt(nameOrId);
		if (!_v0.$) {
			var id = _v0.a;
			var idLst = A2(
				$elm$core$List$filter,
				function (m) {
					return _Utils_eq(m.j, id);
				},
				exp.n);
			return $elm$core$List$head(idLst);
		} else {
			var nameLst = A2(
				$elm$core$List$filter,
				function (m) {
					return _Utils_eq(m.l, nameOrId);
				},
				exp.n);
			return $elm$core$List$head(nameLst);
		}
	});
var $elm$regex$Regex$replace = _Regex_replaceAtMost(_Regex_infinity);
var $author$project$Exposition$withPrefix = F2(
	function (prefix, str) {
		if (prefix.$ === 1) {
			return str;
		} else {
			var pre = prefix.a;
			return _Utils_ap(pre, str);
		}
	});
var $author$project$Exposition$replaceToolsWithImages = F2(
	function (exp, urlPrefix) {
		var r = $elm$regex$Regex$fromString('!{([^}]*)}');
		var md = exp.a7;
		if (r.$ === 1) {
			return md;
		} else {
			var reg = r.a;
			return A3(
				$elm$regex$Regex$replace,
				reg,
				function (m) {
					var _v1 = m.cN;
					if (_v1.b && (!_v1.a.$)) {
						var sub = _v1.a.a;
						return A2(
							$elm$core$Maybe$withDefault,
							'default...media',
							A2(
								$elm$core$Maybe$map,
								function (s) {
									return '![' + (s.l + ('](' + (A2(
										$author$project$Exposition$withPrefix,
										urlPrefix,
										$author$project$Exposition$mediaUrl(s)) + ')')));
								},
								A2($author$project$Exposition$objectByNameOrId, sub, exp)));
					} else {
						return '';
					}
				},
				md);
		}
	});
var $author$project$RCAPI$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 0:
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 1:
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 2:
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 3:
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.fw));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$stringPart = _Http_pair;
var $author$project$RCAPI$typeEnding = function (t) {
	switch (t) {
		case 0:
			return 'pdf';
		case 1:
			return 'docx';
		case 2:
			return 'odt';
		case 3:
			return 'tex';
		case 4:
			return 'html';
		case 5:
			return 'md';
		default:
			return 'epub';
	}
};
var $author$project$RCAPI$convertExposition = F3(
	function (ctype, expo, expectMsg) {
		var exportExpoMd = A2(
			$author$project$Exposition$replaceToolsWithImages,
			expo,
			$elm$core$Maybe$Just($author$project$Settings$baseDomain));
		return $elm$http$Http$post(
			{
				K: $elm$http$Http$multipartBody(
					_List_fromArray(
						[
							A2($elm$http$Http$stringPart, 'markdown', exportExpoMd)
						])),
				N: A2(
					$elm$http$Http$expectBytesResponse,
					expectMsg(ctype),
					$author$project$RCAPI$resolve($elm$core$Result$Ok)),
				V: 'text-editor/export' + ('?type=' + $author$project$RCAPI$typeEnding(ctype))
			});
	});
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$convertMarkdown = _Platform_outgoingPort('convertMarkdown', $elm$json$Json$Encode$string);
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Main$decodeGeneration = A3(
	$elm$json$Json$Decode$map2,
	$elm$core$Tuple$pair,
	A2($elm$json$Json$Decode$field, 'md', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'style', $elm$json$Json$Decode$int));
var $elm$http$Http$expectWhatever = function (toMsg) {
	return A2(
		$elm$http$Http$expectBytesResponse,
		toMsg,
		$elm$http$Http$resolve(
			function (_v0) {
				return $elm$core$Result$Ok(0);
			}));
};
var $author$project$RCAPI$deleteMedia = F2(
	function (mediaObject, expect) {
		return $elm$http$Http$post(
			{
				K: $elm$http$Http$emptyBody,
				N: $elm$http$Http$expectWhatever(expect),
				V: 'text-editor/simple-media-remove?research=' + ($elm$core$String$fromInt(mediaObject.bU) + ('&simple-media=' + $elm$core$String$fromInt(mediaObject.j)))
			});
	});
var $elm$file$File$Download$bytes = F3(
	function (name, mime, content) {
		return A2(
			$elm$core$Task$perform,
			$elm$core$Basics$never,
			A3(
				_File_download,
				name,
				mime,
				_File_makeBytesSafeForInternetExplorer(content)));
	});
var $author$project$RCAPI$downloadExport = F2(
	function (ctype, content) {
		var _v0 = function () {
			switch (ctype) {
				case 0:
					return _Utils_Tuple2('export.pdf', 'application/pdf');
				case 2:
					return _Utils_Tuple2('export.odt', 'application/vnd.oasis.opendocument.text');
				case 1:
					return _Utils_Tuple2('export.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
				case 4:
					return _Utils_Tuple2('export.html', 'text/html');
				case 5:
					return _Utils_Tuple2('export.md', 'text/plain');
				case 6:
					return _Utils_Tuple2('export.epub', 'application/epub+zip');
				default:
					return _Utils_Tuple2('export.tex', 'application/x-latex');
			}
		}();
		var fname = _v0.a;
		var mime = _v0.b;
		return A3($elm$file$File$Download$bytes, fname, mime, content);
	});
var $author$project$Main$enumTabState = function (t) {
	switch (t) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$http$Http$expectString = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		$elm$http$Http$resolve($elm$core$Result$Ok));
};
var $elm$file$File$Select$file = F2(
	function (mimes, toMsg) {
		return A2(
			$elm$core$Task$perform,
			toMsg,
			_File_uploadOne(mimes));
	});
var $author$project$FootnoteHelper$footnoteSnippet = function (num) {
	var numstr = $elm$core$String$fromInt(num);
	return _Utils_Tuple2('[^' + (numstr + ']'), '[^' + (numstr + ']: footnote-text'));
};
var $zwilias$elm_html_string$Html$Types$Attribute = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$attribute = $zwilias$elm_html_string$Html$Types$Attribute;
var $zwilias$elm_html_string$Html$String$Attributes$height = function (val) {
	return A2(
		$zwilias$elm_html_string$Html$String$Attributes$attribute,
		'height',
		$elm$core$String$fromInt(val));
};
var $zwilias$elm_html_string$Html$String$Attributes$width = function (val) {
	return A2(
		$zwilias$elm_html_string$Html$String$Attributes$attribute,
		'width',
		$elm$core$String$fromInt(val));
};
var $author$project$Exposition$addDimensions = F2(
	function (dims, attributes) {
		if (dims.$ === 1) {
			return attributes;
		} else {
			var _v1 = dims.a;
			var w = _v1.a;
			var h = _v1.b;
			return _Utils_ap(
				attributes,
				_List_fromArray(
					[
						$zwilias$elm_html_string$Html$String$Attributes$height(h),
						$zwilias$elm_html_string$Html$String$Attributes$width(w)
					]));
		}
	});
var $zwilias$elm_html_string$Html$Types$StringProperty = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$stringProperty = $zwilias$elm_html_string$Html$Types$StringProperty;
var $zwilias$elm_html_string$Html$String$Attributes$alt = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'alt', val);
};
var $zwilias$elm_html_string$Html$Types$Node = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $zwilias$elm_html_string$Html$Types$Regular = function (a) {
	return {$: 1, a: a};
};
var $zwilias$elm_html_string$Html$String$node = F3(
	function (tag, attributes, children) {
		return A3(
			$zwilias$elm_html_string$Html$Types$Node,
			tag,
			attributes,
			$zwilias$elm_html_string$Html$Types$Regular(children));
	});
var $zwilias$elm_html_string$Html$String$audio = $zwilias$elm_html_string$Html$String$node('audio');
var $zwilias$elm_html_string$Html$Types$BoolProperty = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$boolProperty = $zwilias$elm_html_string$Html$Types$BoolProperty;
var $zwilias$elm_html_string$Html$String$Attributes$autoplay = function (bool) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$boolProperty, 'autoplay', bool);
};
var $zwilias$elm_html_string$Html$String$Attributes$class = function (className) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'className', className);
};
var $zwilias$elm_html_string$Html$String$Attributes$controls = function (bool) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$boolProperty, 'controls', bool);
};
var $zwilias$elm_html_string$Html$String$figcaption = $zwilias$elm_html_string$Html$String$node('figcaption');
var $zwilias$elm_html_string$Html$String$figure = $zwilias$elm_html_string$Html$String$node('figure');
var $zwilias$elm_html_string$Html$String$Attributes$id = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'id', val);
};
var $zwilias$elm_html_string$Html$Types$NoChildren = {$: 0};
var $zwilias$elm_html_string$Html$String$nodeWithoutChildren = F3(
	function (tag, attrs, _v0) {
		return A3($zwilias$elm_html_string$Html$Types$Node, tag, attrs, $zwilias$elm_html_string$Html$Types$NoChildren);
	});
var $zwilias$elm_html_string$Html$String$img = $zwilias$elm_html_string$Html$String$nodeWithoutChildren('img');
var $zwilias$elm_html_string$Html$String$Attributes$loop = function (bool) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$boolProperty, 'loop', bool);
};
var $zwilias$elm_html_string$Html$String$object = $zwilias$elm_html_string$Html$String$node('object');
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $zwilias$elm_html_string$Html$String$Attributes$classList = function (conditionalClasses) {
	return $zwilias$elm_html_string$Html$String$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, conditionalClasses))));
};
var $zwilias$elm_html_string$Html$String$div = $zwilias$elm_html_string$Html$String$node('div');
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Exposition$rcClass = function (t) {
	switch (t.$) {
		case 0:
			return 'rcvideo';
		case 1:
			return 'rcaudio';
		case 2:
			return 'rcsvg';
		case 3:
			return 'rcpdf';
		default:
			return 'rcimage';
	}
};
var $author$project$Exposition$objectDiv = F2(
	function (obj, child) {
		return A2(
			$zwilias$elm_html_string$Html$String$div,
			_List_fromArray(
				[
					$zwilias$elm_html_string$Html$String$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('rcobject', true),
							_Utils_Tuple2(obj.W, obj.W !== ''),
							_Utils_Tuple2(
							$author$project$Exposition$rcClass(obj.b8),
							true),
							_Utils_Tuple2(
							'rc-media-' + $elm$core$String$fromInt(obj.j),
							true)
						]))
				]),
			_List_fromArray(
				[child]));
	});
var $zwilias$elm_html_string$Html$String$Attributes$preload = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'preload', val);
};
var $author$project$Exposition$preloadToString = function (p) {
	switch (p) {
		case 0:
			return 'auto';
		case 1:
			return 'metadata';
		default:
			return 'none';
	}
};
var $zwilias$elm_html_string$Html$String$source = $zwilias$elm_html_string$Html$String$nodeWithoutChildren('source');
var $zwilias$elm_html_string$Html$String$Attributes$src = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'src', val);
};
var $zwilias$elm_html_string$Html$Types$TextNode = function (a) {
	return {$: 1, a: a};
};
var $zwilias$elm_html_string$Html$String$text = $zwilias$elm_html_string$Html$Types$TextNode;
var $zwilias$elm_html_string$Html$String$label = $zwilias$elm_html_string$Html$String$node('label');
var $zwilias$elm_html_string$Html$Types$Style = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $zwilias$elm_html_string$Html$String$Attributes$style = $zwilias$elm_html_string$Html$Types$Style;
var $zwilias$elm_html_string$Html$String$Attributes$title = function (val) {
	return A2($zwilias$elm_html_string$Html$String$Attributes$stringProperty, 'title', val);
};
var $author$project$Exposition$transcodingMediaPlaceholder = function (transcodingString) {
	return A2(
		$zwilias$elm_html_string$Html$String$label,
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$Attributes$title('Wait for transcoding to finish or upload media again.'),
				A2($zwilias$elm_html_string$Html$String$Attributes$style, 'padding', '10px'),
				A2($zwilias$elm_html_string$Html$String$Attributes$style, 'border', '1px dashed rgb(119, 119, 119)'),
				A2($zwilias$elm_html_string$Html$String$Attributes$style, 'background-color', 'rgb(255, 183, 183)'),
				A2($zwilias$elm_html_string$Html$String$Attributes$style, 'font-size', '0.8em')
			]),
		_List_fromArray(
			[
				$zwilias$elm_html_string$Html$String$text(transcodingString)
			]));
};
var $zwilias$elm_html_string$Html$String$video = $zwilias$elm_html_string$Html$String$node('video');
var $author$project$Exposition$asHtml = F2(
	function (media, mediaId) {
		var _v0 = media.eJ;
		if (_v0.$ === 1) {
			var str = _v0.a;
			return $author$project$Exposition$transcodingMediaPlaceholder(str);
		} else {
			var _v1 = _Utils_Tuple2(media.b8, media);
			switch (_v1.a.$) {
				case 4:
					var _v2 = _v1.a;
					var data = _v1.b;
					return A2(
						$author$project$Exposition$objectDiv,
						data,
						A2(
							$zwilias$elm_html_string$Html$String$figure,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$id(mediaId)
								]),
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$img,
									A2(
										$author$project$Exposition$addDimensions,
										data.ar,
										_List_fromArray(
											[
												$zwilias$elm_html_string$Html$String$Attributes$src(
												$author$project$Exposition$mediaUrl(data)),
												$zwilias$elm_html_string$Html$String$Attributes$alt(data.l)
											])),
									_List_Nil),
									A2(
									$zwilias$elm_html_string$Html$String$figcaption,
									_List_Nil,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(data.X)
										]))
								])));
				case 3:
					var _v3 = _v1.a;
					var data = _v1.b;
					return A2(
						$author$project$Exposition$objectDiv,
						data,
						A2(
							$zwilias$elm_html_string$Html$String$figure,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$id(mediaId)
								]),
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$object,
									A2(
										$author$project$Exposition$addDimensions,
										data.ar,
										_List_fromArray(
											[
												A2(
												$zwilias$elm_html_string$Html$String$Attributes$attribute,
												'data',
												$author$project$Exposition$mediaUrl(data)),
												A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'type', 'application/pdf'),
												A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'title', data.l)
											])),
									_List_Nil),
									A2(
									$zwilias$elm_html_string$Html$String$figcaption,
									_List_Nil,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(data.X)
										]))
								])));
				case 2:
					var _v4 = _v1.a;
					var data = _v1.b;
					return A2(
						$author$project$Exposition$objectDiv,
						data,
						A2(
							$zwilias$elm_html_string$Html$String$figure,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$id(mediaId)
								]),
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$object,
									A2(
										$author$project$Exposition$addDimensions,
										data.ar,
										_List_fromArray(
											[
												A2(
												$zwilias$elm_html_string$Html$String$Attributes$attribute,
												'data',
												$author$project$Exposition$mediaUrl(data)),
												A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'type', 'application/svg+xml'),
												A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'title', data.l)
											])),
									_List_Nil),
									A2(
									$zwilias$elm_html_string$Html$String$figcaption,
									_List_Nil,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(data.X)
										]))
								])));
				case 1:
					var playerData = _v1.a.a;
					var data = _v1.b;
					return A2(
						$author$project$Exposition$objectDiv,
						data,
						A2(
							$zwilias$elm_html_string$Html$String$figure,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$id(mediaId)
								]),
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$audio,
									A2(
										$author$project$Exposition$addDimensions,
										data.ar,
										_List_fromArray(
											[
												$zwilias$elm_html_string$Html$String$Attributes$controls(true),
												$zwilias$elm_html_string$Html$String$Attributes$preload(
												$author$project$Exposition$preloadToString(playerData.cr)),
												$zwilias$elm_html_string$Html$String$Attributes$autoplay(playerData.bF),
												$zwilias$elm_html_string$Html$String$Attributes$loop(playerData.b7),
												$zwilias$elm_html_string$Html$String$Attributes$class('rcaudio')
											])),
									_List_fromArray(
										[
											A2(
											$zwilias$elm_html_string$Html$String$source,
											_List_fromArray(
												[
													$zwilias$elm_html_string$Html$String$Attributes$src(
													$author$project$Exposition$mediaUrl(data))
												]),
											_List_Nil)
										])),
									A2(
									$zwilias$elm_html_string$Html$String$figcaption,
									_List_Nil,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(data.X)
										]))
								])));
				default:
					var playerData = _v1.a.a;
					var data = _v1.b;
					return A2(
						$author$project$Exposition$objectDiv,
						data,
						A2(
							$zwilias$elm_html_string$Html$String$figure,
							_List_fromArray(
								[
									$zwilias$elm_html_string$Html$String$Attributes$id(mediaId)
								]),
							_List_fromArray(
								[
									A2(
									$zwilias$elm_html_string$Html$String$video,
									A2(
										$author$project$Exposition$addDimensions,
										data.ar,
										_List_fromArray(
											[
												$zwilias$elm_html_string$Html$String$Attributes$controls(true),
												$zwilias$elm_html_string$Html$String$Attributes$preload(
												$author$project$Exposition$preloadToString(playerData.cr)),
												$zwilias$elm_html_string$Html$String$Attributes$autoplay(playerData.bF),
												$zwilias$elm_html_string$Html$String$Attributes$loop(playerData.b7)
											])),
									_List_fromArray(
										[
											A2(
											$zwilias$elm_html_string$Html$String$source,
											_List_fromArray(
												[
													$zwilias$elm_html_string$Html$String$Attributes$src(
													$author$project$Exposition$mediaUrl(data)),
													A2($zwilias$elm_html_string$Html$String$Attributes$attribute, 'type', 'video/mp4')
												]),
											_List_Nil)
										])),
									A2(
									$zwilias$elm_html_string$Html$String$figcaption,
									_List_Nil,
									_List_fromArray(
										[
											$zwilias$elm_html_string$Html$String$text(data.X)
										]))
								])));
			}
		}
	});
var $author$project$Exposition$missingMediaPlaceholder = function (mediaName) {
	return '<label title=\"You can add a file by using add media button.\" style=\"padding: 10px; border: 1px dashed rgb(119, 119, 119); background-color: rgb(255, 183, 183); font-size:0.8em;\"> Problem: media file with name \"' + (mediaName + '\" does not exist in the media list. </label>');
};
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $zwilias$elm_html_string$Html$Types$indent = F3(
	function (perLevel, level, x) {
		return _Utils_ap(
			A2($elm$core$String$repeat, perLevel * level, ' '),
			x);
	});
var $zwilias$elm_html_string$Html$Types$join = F2(
	function (between, list) {
		if (!list.b) {
			return '';
		} else {
			if (!list.b.b) {
				var x = list.a;
				return x;
			} else {
				var x = list.a;
				var xs = list.b;
				return A3(
					$elm$core$List$foldl,
					F2(
						function (y, acc) {
							return _Utils_ap(
								y,
								_Utils_ap(between, acc));
						}),
					x,
					xs);
			}
		}
	});
var $zwilias$elm_html_string$Html$Types$closingTag = function (tagName) {
	return '</' + (tagName + '>');
};
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $zwilias$elm_html_string$Html$Types$escapeHtmlText = A2(
	$elm$core$Basics$composeR,
	A2($elm$core$String$replace, '&', '&amp;'),
	A2(
		$elm$core$Basics$composeR,
		A2($elm$core$String$replace, '<', '&lt;'),
		A2($elm$core$String$replace, '>', '&gt;')));
var $elm$core$String$foldl = _String_foldl;
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $zwilias$elm_html_string$Html$Types$escape = A2(
	$elm$core$String$foldl,
	F2(
		function (_char, acc) {
			return (_char === '\"') ? (acc + '\\\"') : _Utils_ap(
				acc,
				$elm$core$String$fromChar(_char));
		}),
	'');
var $elm$core$Char$toLower = _Char_toLower;
var $zwilias$elm_html_string$Html$Types$hyphenate = A2(
	$elm$core$String$foldl,
	F2(
		function (_char, acc) {
			return $elm$core$Char$isUpper(_char) ? (acc + ('-' + $elm$core$String$fromChar(
				$elm$core$Char$toLower(_char)))) : _Utils_ap(
				acc,
				$elm$core$String$fromChar(_char));
		}),
	'');
var $zwilias$elm_html_string$Html$Types$buildProp = F2(
	function (key, value) {
		return $zwilias$elm_html_string$Html$Types$hyphenate(key) + ('=\"' + ($zwilias$elm_html_string$Html$Types$escape(value) + '\"'));
	});
var $NoRedInk$elm_string_conversions$String$Conversions$fromValue = function (value) {
	return A2($elm$json$Json$Encode$encode, 0, value);
};
var $zwilias$elm_html_string$Html$Types$propName = function (prop) {
	switch (prop) {
		case 'className':
			return 'class';
		case 'defaultValue':
			return 'value';
		case 'htmlFor':
			return 'for';
		default:
			return prop;
	}
};
var $zwilias$elm_html_string$Html$Types$addAttribute = F2(
	function (attribute, acc) {
		var classes = acc.a;
		var styles = acc.b;
		var attrs = acc.c;
		switch (attribute.$) {
			case 0:
				var key = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						A2($zwilias$elm_html_string$Html$Types$buildProp, key, value),
						attrs));
			case 1:
				if (attribute.a === 'className') {
					var value = attribute.b;
					return _Utils_Tuple3(
						A2($elm$core$List$cons, value, classes),
						styles,
						attrs);
				} else {
					var string = attribute.a;
					var value = attribute.b;
					return _Utils_Tuple3(
						classes,
						styles,
						A2(
							$elm$core$List$cons,
							A2(
								$zwilias$elm_html_string$Html$Types$buildProp,
								$zwilias$elm_html_string$Html$Types$propName(string),
								value),
							attrs));
				}
			case 2:
				var string = attribute.a;
				var enabled = attribute.b;
				return enabled ? _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						$zwilias$elm_html_string$Html$Types$hyphenate(
							$zwilias$elm_html_string$Html$Types$propName(string)),
						attrs)) : acc;
			case 3:
				var string = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					styles,
					A2(
						$elm$core$List$cons,
						A2(
							$zwilias$elm_html_string$Html$Types$buildProp,
							$zwilias$elm_html_string$Html$Types$propName(string),
							$NoRedInk$elm_string_conversions$String$Conversions$fromValue(value)),
						attrs));
			case 4:
				var key = attribute.a;
				var value = attribute.b;
				return _Utils_Tuple3(
					classes,
					A2(
						$elm$core$List$cons,
						$zwilias$elm_html_string$Html$Types$escape(key) + (': ' + $zwilias$elm_html_string$Html$Types$escape(value)),
						styles),
					attrs);
			default:
				return acc;
		}
	});
var $zwilias$elm_html_string$Html$Types$withClasses = F2(
	function (classes, attrs) {
		if (!classes.b) {
			return attrs;
		} else {
			return A2(
				$elm$core$List$cons,
				A2(
					$zwilias$elm_html_string$Html$Types$buildProp,
					'class',
					A2($zwilias$elm_html_string$Html$Types$join, ' ', classes)),
				attrs);
		}
	});
var $zwilias$elm_html_string$Html$Types$withStyles = F2(
	function (styles, attrs) {
		if (!styles.b) {
			return attrs;
		} else {
			return A2(
				$elm$core$List$cons,
				A2(
					$zwilias$elm_html_string$Html$Types$buildProp,
					'style',
					A2($zwilias$elm_html_string$Html$Types$join, '; ', styles)),
				attrs);
		}
	});
var $zwilias$elm_html_string$Html$Types$attributesToString = function (attrs) {
	var _v0 = A3(
		$elm$core$List$foldl,
		$zwilias$elm_html_string$Html$Types$addAttribute,
		_Utils_Tuple3(_List_Nil, _List_Nil, _List_Nil),
		attrs);
	var classes = _v0.a;
	var styles = _v0.b;
	var regular = _v0.c;
	return A2(
		$zwilias$elm_html_string$Html$Types$withStyles,
		styles,
		A2($zwilias$elm_html_string$Html$Types$withClasses, classes, regular));
};
var $zwilias$elm_html_string$Html$Types$tag = F2(
	function (tagName, attributes) {
		return '<' + (A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$cons,
				tagName,
				$zwilias$elm_html_string$Html$Types$attributesToString(attributes))) + '>');
	});
var $zwilias$elm_html_string$Html$Types$toStringHelper = F3(
	function (indenter, tags, acc) {
		toStringHelper:
		while (true) {
			if (!tags.b) {
				var _v1 = acc.S;
				if (!_v1.b) {
					return acc;
				} else {
					var _v2 = _v1.a;
					var tagName = _v2.a;
					var cont = _v2.b;
					var rest = _v1.b;
					var $temp$indenter = indenter,
						$temp$tags = cont,
						$temp$acc = _Utils_update(
						acc,
						{
							u: acc.u - 1,
							y: A2(
								$elm$core$List$cons,
								A2(
									indenter,
									acc.u - 1,
									$zwilias$elm_html_string$Html$Types$closingTag(tagName)),
								acc.y),
							S: rest
						});
					indenter = $temp$indenter;
					tags = $temp$tags;
					acc = $temp$acc;
					continue toStringHelper;
				}
			} else {
				if (!tags.a.$) {
					var _v3 = tags.a;
					var tagName = _v3.a;
					var attributes = _v3.b;
					var children = _v3.c;
					var rest = tags.b;
					switch (children.$) {
						case 0:
							var $temp$indenter = indenter,
								$temp$tags = rest,
								$temp$acc = _Utils_update(
								acc,
								{
									y: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.u,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.y)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
						case 1:
							var childNodes = children.a;
							var $temp$indenter = indenter,
								$temp$tags = childNodes,
								$temp$acc = _Utils_update(
								acc,
								{
									u: acc.u + 1,
									y: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.u,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.y),
									S: A2(
										$elm$core$List$cons,
										_Utils_Tuple2(tagName, rest),
										acc.S)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
						default:
							var childNodes = children.a;
							var $temp$indenter = indenter,
								$temp$tags = A2($elm$core$List$map, $elm$core$Tuple$second, childNodes),
								$temp$acc = _Utils_update(
								acc,
								{
									u: acc.u + 1,
									y: A2(
										$elm$core$List$cons,
										A2(
											indenter,
											acc.u,
											A2($zwilias$elm_html_string$Html$Types$tag, tagName, attributes)),
										acc.y),
									S: A2(
										$elm$core$List$cons,
										_Utils_Tuple2(tagName, rest),
										acc.S)
								});
							indenter = $temp$indenter;
							tags = $temp$tags;
							acc = $temp$acc;
							continue toStringHelper;
					}
				} else {
					var string = tags.a.a;
					var rest = tags.b;
					var $temp$indenter = indenter,
						$temp$tags = rest,
						$temp$acc = _Utils_update(
						acc,
						{
							y: A2(
								$elm$core$List$cons,
								A2(
									indenter,
									acc.u,
									$zwilias$elm_html_string$Html$Types$escapeHtmlText(string)),
								acc.y)
						});
					indenter = $temp$indenter;
					tags = $temp$tags;
					acc = $temp$acc;
					continue toStringHelper;
				}
			}
		}
	});
var $zwilias$elm_html_string$Html$Types$toString = F2(
	function (depth, html) {
		var joinString = function () {
			if (!depth) {
				return '';
			} else {
				return '\n';
			}
		}();
		var initialAcc = {u: 0, y: _List_Nil, S: _List_Nil};
		var indenter = function () {
			if (!depth) {
				return $elm$core$Basics$always($elm$core$Basics$identity);
			} else {
				return $zwilias$elm_html_string$Html$Types$indent(depth);
			}
		}();
		return A2(
			$zwilias$elm_html_string$Html$Types$join,
			joinString,
			A3(
				$zwilias$elm_html_string$Html$Types$toStringHelper,
				indenter,
				_List_fromArray(
					[html]),
				initialAcc).y);
	});
var $zwilias$elm_html_string$Html$String$toString = function (indent) {
	return $zwilias$elm_html_string$Html$Types$toString(indent);
};
var $author$project$Exposition$insertToolHtml = F2(
	function (md, exp) {
		var r = $elm$regex$Regex$fromString('!(?:\\[[^\\]]*\\])?{([^}]*)}');
		if (r.$ === 1) {
			return md;
		} else {
			var reg = r.a;
			return A3(
				$elm$regex$Regex$replace,
				reg,
				function (m) {
					var _v1 = m.cN;
					if (_v1.b && (!_v1.a.$)) {
						var sub = _v1.a.a;
						return A2(
							$elm$core$Maybe$withDefault,
							$author$project$Exposition$missingMediaPlaceholder(sub),
							A2(
								$elm$core$Maybe$map,
								function (o) {
									return A2(
										$zwilias$elm_html_string$Html$String$toString,
										0,
										A2(
											$author$project$Exposition$asHtml,
											o,
											'media-' + $elm$core$String$fromInt(m.fn)));
								},
								A2($author$project$Exposition$objectByNameOrId, sub, exp)));
					} else {
						return '';
					}
				},
				md);
		}
	});
var $author$project$Exposition$withCSS = F2(
	function (exp, content) {
		return _Utils_update(
			exp,
			{c4: content});
	});
var $author$project$Exposition$withHtml = F2(
	function (exp, content) {
		return _Utils_update(
			exp,
			{cF: '<div class=\"exposition\">' + (content + '</div>')});
	});
var $author$project$Exposition$withMd = F2(
	function (exp, content) {
		return _Utils_update(
			exp,
			{a7: content});
	});
var $author$project$Main$forceRerender = function (model) {
	var newHtml = A2($author$project$Exposition$insertToolHtml, model.b.a7, model.b);
	return _Utils_Tuple2(
		_Utils_update(
			model,
			{
				b: A2(
					$author$project$Exposition$withCSS,
					A2(
						$author$project$Exposition$withHtml,
						A2($author$project$Exposition$withMd, model.b, model.b.a7),
						newHtml),
					model.b.c4)
			}),
		$author$project$Main$convertMarkdown(newHtml));
};
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $elm$http$Http$fractionSent = function (p) {
	return (!p.eG) ? 1 : A3($elm$core$Basics$clamp, 0, 1, p.fv / p.eG);
};
var $author$project$Main$getContent = _Platform_outgoingPort(
	'getContent',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$RCAPI$getMediaList = F2(
	function (id, msg) {
		return $elm$http$Http$request(
			{
				K: $elm$http$Http$emptyBody,
				N: A2(
					$elm$http$Http$expectJson,
					msg,
					$elm$json$Json$Decode$list($author$project$RCAPI$apiMediaEntry)),
				au: _List_fromArray(
					[
						A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
					]),
				aB: 'GET',
				aK: $elm$core$Maybe$Nothing,
				aL: $elm$core$Maybe$Nothing,
				V: '/text-editor/simple-media-list?research=' + $elm$core$String$fromInt(id)
			});
	});
var $author$project$Main$CmMarkdownTab = 0;
var $author$project$Main$MediaListTab = 3;
var $author$project$Main$StyleTab = 2;
var $author$project$Main$TxtMarkdownTab = 1;
var $author$project$Main$getTabState = function (state) {
	switch (state.a) {
		case 0:
			if (!state.b) {
				var _v1 = state.a;
				var _v2 = state.b;
				return 0;
			} else {
				var _v3 = state.a;
				var _v4 = state.b;
				return 1;
			}
		case 1:
			var _v5 = state.a;
			return 2;
		default:
			var _v6 = state.a;
			return 3;
	}
};
var $author$project$Exposition$incContentVersion = function (exp) {
	return _Utils_update(
		exp,
		{bP: exp.bP + 1});
};
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $author$project$Main$insertFootnote = _Platform_outgoingPort(
	'insertFootnote',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			$elm$json$Json$Encode$list,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					$elm$json$Json$Encode$string(a),
					$elm$json$Json$Encode$string(b)
				]));
	});
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$Main$insertMdString = _Platform_outgoingPort(
	'insertMdString',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			$elm$json$Json$Encode$list,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					$elm$json$Json$Encode$string(a),
					$elm$json$Json$Encode$int(b)
				]));
	});
var $author$project$Main$setEditor = _Platform_outgoingPort('setEditor', $elm$json$Json$Encode$int);
var $author$project$Main$insertMediaUpdate = F2(
	function (object, model) {
		var foundObj = A2(
			$author$project$Exposition$objectByNameOrId,
			$elm$core$String$fromInt(object.j),
			model.b);
		if (!foundObj.$) {
			var o = foundObj.a;
			var updatedModel = _Utils_update(
				model,
				{
					D: $author$project$RCMediaEdit$empty,
					r: _Utils_Tuple2(model.r.a, $rundis$elm_bootstrap$Bootstrap$Modal$hidden)
				});
			var closeMediaListIfOpen = function () {
				var _v1 = model.p;
				if (_v1.a === 2) {
					if (!_v1.b) {
						var _v2 = _v1.a;
						var _v3 = _v1.b;
						return $author$project$Main$setEditor(0);
					} else {
						var _v4 = _v1.a;
						var _v5 = _v1.b;
						return $author$project$Main$setEditor(1);
					}
				} else {
					return $elm$core$Platform$Cmd$none;
				}
			}();
			return _Utils_Tuple2(
				updatedModel,
				$elm$core$Platform$Cmd$batch(
					_List_fromArray(
						[
							$author$project$Main$insertMdString(
							_Utils_Tuple2('!{' + (o.l + '}'), 0)),
							closeMediaListIfOpen
						])));
		} else {
			return _Utils_Tuple2(
				A2(
					$author$project$Main$addProblem,
					model,
					$author$project$Problems$NoMediaWithNameOrId(object.l)),
				$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Exposition$isValid = function (st) {
	var _v0 = _Utils_Tuple2(
		_Utils_Tuple2(st.l, st.aW),
		_Utils_Tuple2(st.aU, st.W));
	if ((((!_v0.a.a.$) && (!_v0.a.b.$)) && (!_v0.b.a.$)) && (!_v0.b.b.$)) {
		var _v1 = _v0.a;
		var _v2 = _v0.b;
		return true;
	} else {
		return false;
	}
};
var $author$project$FootnoteHelper$Sorted = function (a) {
	return {$: 0, a: a};
};
var $author$project$FootnoteHelper$getRank = function (f) {
	switch (f.$) {
		case 0:
			var num = f.a;
			return num;
		case 1:
			var name = f.a;
			return -1;
		case 2:
			return -1;
		default:
			return -1;
	}
};
var $author$project$FootnoteHelper$NumberedNote = function (a) {
	return {$: 0, a: a};
};
var $author$project$FootnoteHelper$dummy = $author$project$FootnoteHelper$NumberedNote(-1);
var $author$project$FootnoteHelper$nextNote = function () {
	var unpack = function (sortable) {
		if (!sortable.$) {
			var x = sortable.a;
			return x;
		} else {
			var x = sortable.a;
			return _List_Nil;
		}
	};
	var replaceZero = function (x) {
		return (!x) ? 1 : x;
	};
	return A2(
		$elm$core$Basics$composeR,
		unpack,
		A2(
			$elm$core$Basics$composeR,
			$elm$core$List$reverse,
			A2(
				$elm$core$Basics$composeR,
				$elm$core$List$head,
				A2(
					$elm$core$Basics$composeR,
					$elm$core$Maybe$withDefault($author$project$FootnoteHelper$dummy),
					A2(
						$elm$core$Basics$composeR,
						$author$project$FootnoteHelper$getRank,
						A2(
							$elm$core$Basics$composeR,
							$elm$core$Basics$add(1),
							replaceZero))))));
}();
var $author$project$FootnoteHelper$Content = {$: 2};
var $elm$parser$Parser$Done = function (a) {
	return {$: 1, a: a};
};
var $elm$parser$Parser$Loop = function (a) {
	return {$: 0, a: a};
};
var $elm$parser$Parser$Advanced$Parser = $elm$core$Basics$identity;
var $elm$parser$Parser$Advanced$Good = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm$parser$Parser$Advanced$isSubChar = _Parser_isSubChar;
var $elm$parser$Parser$Advanced$chompWhileHelp = F5(
	function (isGood, offset, row, col, s0) {
		chompWhileHelp:
		while (true) {
			var newOffset = A3($elm$parser$Parser$Advanced$isSubChar, isGood, offset, s0.a);
			if (_Utils_eq(newOffset, -1)) {
				return A3(
					$elm$parser$Parser$Advanced$Good,
					_Utils_cmp(s0.ej, offset) < 0,
					0,
					{dN: col, e: s0.e, g: s0.g, ej: offset, eA: row, a: s0.a});
			} else {
				if (_Utils_eq(newOffset, -2)) {
					var $temp$isGood = isGood,
						$temp$offset = offset + 1,
						$temp$row = row + 1,
						$temp$col = 1,
						$temp$s0 = s0;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					s0 = $temp$s0;
					continue chompWhileHelp;
				} else {
					var $temp$isGood = isGood,
						$temp$offset = newOffset,
						$temp$row = row,
						$temp$col = col + 1,
						$temp$s0 = s0;
					isGood = $temp$isGood;
					offset = $temp$offset;
					row = $temp$row;
					col = $temp$col;
					s0 = $temp$s0;
					continue chompWhileHelp;
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$chompWhile = function (isGood) {
	return function (s) {
		return A5($elm$parser$Parser$Advanced$chompWhileHelp, isGood, s.ej, s.eA, s.dN, s);
	};
};
var $elm$parser$Parser$chompWhile = $elm$parser$Parser$Advanced$chompWhile;
var $elm$parser$Parser$UnexpectedChar = {$: 11};
var $elm$parser$Parser$Advanced$Bad = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$parser$Parser$Advanced$AddRight = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$parser$Parser$Advanced$DeadEnd = F4(
	function (row, col, problem, contextStack) {
		return {dN: col, e7: contextStack, eq: problem, eA: row};
	});
var $elm$parser$Parser$Advanced$Empty = {$: 0};
var $elm$parser$Parser$Advanced$fromState = F2(
	function (s, x) {
		return A2(
			$elm$parser$Parser$Advanced$AddRight,
			$elm$parser$Parser$Advanced$Empty,
			A4($elm$parser$Parser$Advanced$DeadEnd, s.eA, s.dN, x, s.e));
	});
var $elm$parser$Parser$Advanced$chompIf = F2(
	function (isGood, expecting) {
		return function (s) {
			var newOffset = A3($elm$parser$Parser$Advanced$isSubChar, isGood, s.ej, s.a);
			return _Utils_eq(newOffset, -1) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				false,
				A2($elm$parser$Parser$Advanced$fromState, s, expecting)) : (_Utils_eq(newOffset, -2) ? A3(
				$elm$parser$Parser$Advanced$Good,
				true,
				0,
				{dN: 1, e: s.e, g: s.g, ej: s.ej + 1, eA: s.eA + 1, a: s.a}) : A3(
				$elm$parser$Parser$Advanced$Good,
				true,
				0,
				{dN: s.dN + 1, e: s.e, g: s.g, ej: newOffset, eA: s.eA, a: s.a}));
		};
	});
var $elm$parser$Parser$chompIf = function (isGood) {
	return A2($elm$parser$Parser$Advanced$chompIf, isGood, $elm$parser$Parser$UnexpectedChar);
};
var $elm$parser$Parser$Advanced$map2 = F3(
	function (func, _v0, _v1) {
		var parseA = _v0;
		var parseB = _v1;
		return function (s0) {
			var _v2 = parseA(s0);
			if (_v2.$ === 1) {
				var p = _v2.a;
				var x = _v2.b;
				return A2($elm$parser$Parser$Advanced$Bad, p, x);
			} else {
				var p1 = _v2.a;
				var a = _v2.b;
				var s1 = _v2.c;
				var _v3 = parseB(s1);
				if (_v3.$ === 1) {
					var p2 = _v3.a;
					var x = _v3.b;
					return A2($elm$parser$Parser$Advanced$Bad, p1 || p2, x);
				} else {
					var p2 = _v3.a;
					var b = _v3.b;
					var s2 = _v3.c;
					return A3(
						$elm$parser$Parser$Advanced$Good,
						p1 || p2,
						A2(func, a, b),
						s2);
				}
			}
		};
	});
var $elm$parser$Parser$Advanced$ignorer = F2(
	function (keepParser, ignoreParser) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$always, keepParser, ignoreParser);
	});
var $elm$parser$Parser$ignorer = $elm$parser$Parser$Advanced$ignorer;
var $elm$parser$Parser$Advanced$succeed = function (a) {
	return function (s) {
		return A3($elm$parser$Parser$Advanced$Good, false, a, s);
	};
};
var $elm$parser$Parser$succeed = $elm$parser$Parser$Advanced$succeed;
var $elm$parser$Parser$ExpectingSymbol = function (a) {
	return {$: 8, a: a};
};
var $elm$parser$Parser$Advanced$Token = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$parser$Parser$Advanced$isSubString = _Parser_isSubString;
var $elm$core$Basics$not = _Basics_not;
var $elm$parser$Parser$Advanced$token = function (_v0) {
	var str = _v0.a;
	var expecting = _v0.b;
	var progress = !$elm$core$String$isEmpty(str);
	return function (s) {
		var _v1 = A5($elm$parser$Parser$Advanced$isSubString, str, s.ej, s.eA, s.dN, s.a);
		var newOffset = _v1.a;
		var newRow = _v1.b;
		var newCol = _v1.c;
		return _Utils_eq(newOffset, -1) ? A2(
			$elm$parser$Parser$Advanced$Bad,
			false,
			A2($elm$parser$Parser$Advanced$fromState, s, expecting)) : A3(
			$elm$parser$Parser$Advanced$Good,
			progress,
			0,
			{dN: newCol, e: s.e, g: s.g, ej: newOffset, eA: newRow, a: s.a});
	};
};
var $elm$parser$Parser$Advanced$symbol = $elm$parser$Parser$Advanced$token;
var $elm$parser$Parser$symbol = function (str) {
	return $elm$parser$Parser$Advanced$symbol(
		A2(
			$elm$parser$Parser$Advanced$Token,
			str,
			$elm$parser$Parser$ExpectingSymbol(str)));
};
var $author$project$FootnoteHelper$content = A2(
	$elm$parser$Parser$ignorer,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($author$project$FootnoteHelper$Content),
		$elm$parser$Parser$symbol('[')),
	$elm$parser$Parser$chompIf(
		function (_char) {
			return _char !== '[';
		}));
var $elm$parser$Parser$ExpectingEnd = {$: 10};
var $elm$parser$Parser$Advanced$end = function (x) {
	return function (s) {
		return _Utils_eq(
			$elm$core$String$length(s.a),
			s.ej) ? A3($elm$parser$Parser$Advanced$Good, false, 0, s) : A2(
			$elm$parser$Parser$Advanced$Bad,
			false,
			A2($elm$parser$Parser$Advanced$fromState, s, x));
	};
};
var $elm$parser$Parser$end = $elm$parser$Parser$Advanced$end($elm$parser$Parser$ExpectingEnd);
var $elm$parser$Parser$Advanced$keeper = F2(
	function (parseFunc, parseArg) {
		return A3($elm$parser$Parser$Advanced$map2, $elm$core$Basics$apL, parseFunc, parseArg);
	});
var $elm$parser$Parser$keeper = $elm$parser$Parser$Advanced$keeper;
var $author$project$FootnoteHelper$NamedNote = function (a) {
	return {$: 1, a: a};
};
var $elm$parser$Parser$Advanced$andThen = F2(
	function (callback, _v0) {
		var parseA = _v0;
		return function (s0) {
			var _v1 = parseA(s0);
			if (_v1.$ === 1) {
				var p = _v1.a;
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, p, x);
			} else {
				var p1 = _v1.a;
				var a = _v1.b;
				var s1 = _v1.c;
				var _v2 = callback(a);
				var parseB = _v2;
				var _v3 = parseB(s1);
				if (_v3.$ === 1) {
					var p2 = _v3.a;
					var x = _v3.b;
					return A2($elm$parser$Parser$Advanced$Bad, p1 || p2, x);
				} else {
					var p2 = _v3.a;
					var b = _v3.b;
					var s2 = _v3.c;
					return A3($elm$parser$Parser$Advanced$Good, p1 || p2, b, s2);
				}
			}
		};
	});
var $elm$parser$Parser$andThen = $elm$parser$Parser$Advanced$andThen;
var $elm$parser$Parser$Advanced$mapChompedString = F2(
	function (func, _v0) {
		var parse = _v0;
		return function (s0) {
			var _v1 = parse(s0);
			if (_v1.$ === 1) {
				var p = _v1.a;
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, p, x);
			} else {
				var p = _v1.a;
				var a = _v1.b;
				var s1 = _v1.c;
				return A3(
					$elm$parser$Parser$Advanced$Good,
					p,
					A2(
						func,
						A3($elm$core$String$slice, s0.ej, s1.ej, s0.a),
						a),
					s1);
			}
		};
	});
var $elm$parser$Parser$Advanced$getChompedString = function (parser) {
	return A2($elm$parser$Parser$Advanced$mapChompedString, $elm$core$Basics$always, parser);
};
var $elm$parser$Parser$getChompedString = $elm$parser$Parser$Advanced$getChompedString;
var $author$project$FootnoteHelper$strictNote = A2(
	$elm$parser$Parser$andThen,
	function (str) {
		var _v0 = $elm$core$String$toInt(str);
		if (!_v0.$) {
			var _int = _v0.a;
			return $elm$parser$Parser$succeed(
				$author$project$FootnoteHelper$NumberedNote(_int));
		} else {
			return $elm$parser$Parser$succeed(
				$author$project$FootnoteHelper$NamedNote(str));
		}
	},
	$elm$parser$Parser$getChompedString(
		$elm$parser$Parser$chompWhile(
			function (_char) {
				return (_char !== '[') && (_char !== ']');
			})));
var $author$project$FootnoteHelper$footNote = A2(
	$elm$parser$Parser$keeper,
	A2(
		$elm$parser$Parser$ignorer,
		$elm$parser$Parser$succeed($elm$core$Basics$identity),
		$elm$parser$Parser$symbol('[^')),
	$author$project$FootnoteHelper$strictNote);
var $author$project$FootnoteHelper$isUninteresting = function (_char) {
	return _char !== '[';
};
var $elm$parser$Parser$Advanced$map = F2(
	function (func, _v0) {
		var parse = _v0;
		return function (s0) {
			var _v1 = parse(s0);
			if (!_v1.$) {
				var p = _v1.a;
				var a = _v1.b;
				var s1 = _v1.c;
				return A3(
					$elm$parser$Parser$Advanced$Good,
					p,
					func(a),
					s1);
			} else {
				var p = _v1.a;
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, p, x);
			}
		};
	});
var $elm$parser$Parser$map = $elm$parser$Parser$Advanced$map;
var $elm$parser$Parser$Advanced$Append = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $elm$parser$Parser$Advanced$oneOfHelp = F3(
	function (s0, bag, parsers) {
		oneOfHelp:
		while (true) {
			if (!parsers.b) {
				return A2($elm$parser$Parser$Advanced$Bad, false, bag);
			} else {
				var parse = parsers.a;
				var remainingParsers = parsers.b;
				var _v1 = parse(s0);
				if (!_v1.$) {
					var step = _v1;
					return step;
				} else {
					var step = _v1;
					var p = step.a;
					var x = step.b;
					if (p) {
						return step;
					} else {
						var $temp$s0 = s0,
							$temp$bag = A2($elm$parser$Parser$Advanced$Append, bag, x),
							$temp$parsers = remainingParsers;
						s0 = $temp$s0;
						bag = $temp$bag;
						parsers = $temp$parsers;
						continue oneOfHelp;
					}
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$oneOf = function (parsers) {
	return function (s) {
		return A3($elm$parser$Parser$Advanced$oneOfHelp, s, $elm$parser$Parser$Advanced$Empty, parsers);
	};
};
var $elm$parser$Parser$oneOf = $elm$parser$Parser$Advanced$oneOf;
var $author$project$FootnoteHelper$footnotesHelp = function (footnotes) {
	return $elm$parser$Parser$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$parser$Parser$map,
				function (_v0) {
					return $elm$parser$Parser$Done(
						$elm$core$List$reverse(footnotes));
				},
				$elm$parser$Parser$end),
				A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					function (footnote) {
						return $elm$parser$Parser$Loop(
							A2($elm$core$List$cons, footnote, footnotes));
					}),
				$author$project$FootnoteHelper$footNote),
				A2(
				$elm$parser$Parser$keeper,
				$elm$parser$Parser$succeed(
					function (footnote) {
						return $elm$parser$Parser$Loop(
							A2($elm$core$List$cons, footnote, footnotes));
					}),
				$author$project$FootnoteHelper$content),
				A2(
				$elm$parser$Parser$map,
				function (chunk) {
					return $elm$parser$Parser$Loop(
						A2($elm$core$List$cons, $author$project$FootnoteHelper$Content, footnotes));
				},
				$elm$parser$Parser$getChompedString(
					$elm$parser$Parser$chompWhile($author$project$FootnoteHelper$isUninteresting)))
			]));
};
var $elm$parser$Parser$Advanced$loopHelp = F4(
	function (p, state, callback, s0) {
		loopHelp:
		while (true) {
			var _v0 = callback(state);
			var parse = _v0;
			var _v1 = parse(s0);
			if (!_v1.$) {
				var p1 = _v1.a;
				var step = _v1.b;
				var s1 = _v1.c;
				if (!step.$) {
					var newState = step.a;
					var $temp$p = p || p1,
						$temp$state = newState,
						$temp$callback = callback,
						$temp$s0 = s1;
					p = $temp$p;
					state = $temp$state;
					callback = $temp$callback;
					s0 = $temp$s0;
					continue loopHelp;
				} else {
					var result = step.a;
					return A3($elm$parser$Parser$Advanced$Good, p || p1, result, s1);
				}
			} else {
				var p1 = _v1.a;
				var x = _v1.b;
				return A2($elm$parser$Parser$Advanced$Bad, p || p1, x);
			}
		}
	});
var $elm$parser$Parser$Advanced$loop = F2(
	function (state, callback) {
		return function (s) {
			return A4($elm$parser$Parser$Advanced$loopHelp, false, state, callback, s);
		};
	});
var $elm$parser$Parser$Advanced$Done = function (a) {
	return {$: 1, a: a};
};
var $elm$parser$Parser$Advanced$Loop = function (a) {
	return {$: 0, a: a};
};
var $elm$parser$Parser$toAdvancedStep = function (step) {
	if (!step.$) {
		var s = step.a;
		return $elm$parser$Parser$Advanced$Loop(s);
	} else {
		var a = step.a;
		return $elm$parser$Parser$Advanced$Done(a);
	}
};
var $elm$parser$Parser$loop = F2(
	function (state, callback) {
		return A2(
			$elm$parser$Parser$Advanced$loop,
			state,
			function (s) {
				return A2(
					$elm$parser$Parser$map,
					$elm$parser$Parser$toAdvancedStep,
					callback(s));
			});
	});
var $author$project$FootnoteHelper$parseAll = A2($elm$parser$Parser$loop, _List_Nil, $author$project$FootnoteHelper$footnotesHelp);
var $elm$parser$Parser$DeadEnd = F3(
	function (row, col, problem) {
		return {dN: col, eq: problem, eA: row};
	});
var $elm$parser$Parser$problemToDeadEnd = function (p) {
	return A3($elm$parser$Parser$DeadEnd, p.eA, p.dN, p.eq);
};
var $elm$parser$Parser$Advanced$bagToList = F2(
	function (bag, list) {
		bagToList:
		while (true) {
			switch (bag.$) {
				case 0:
					return list;
				case 1:
					var bag1 = bag.a;
					var x = bag.b;
					var $temp$bag = bag1,
						$temp$list = A2($elm$core$List$cons, x, list);
					bag = $temp$bag;
					list = $temp$list;
					continue bagToList;
				default:
					var bag1 = bag.a;
					var bag2 = bag.b;
					var $temp$bag = bag1,
						$temp$list = A2($elm$parser$Parser$Advanced$bagToList, bag2, list);
					bag = $temp$bag;
					list = $temp$list;
					continue bagToList;
			}
		}
	});
var $elm$parser$Parser$Advanced$run = F2(
	function (_v0, src) {
		var parse = _v0;
		var _v1 = parse(
			{dN: 1, e: _List_Nil, g: 1, ej: 0, eA: 1, a: src});
		if (!_v1.$) {
			var value = _v1.b;
			return $elm$core$Result$Ok(value);
		} else {
			var bag = _v1.b;
			return $elm$core$Result$Err(
				A2($elm$parser$Parser$Advanced$bagToList, bag, _List_Nil));
		}
	});
var $elm$parser$Parser$run = F2(
	function (parser, source) {
		var _v0 = A2($elm$parser$Parser$Advanced$run, parser, source);
		if (!_v0.$) {
			var a = _v0.a;
			return $elm$core$Result$Ok(a);
		} else {
			var problems = _v0.a;
			return $elm$core$Result$Err(
				A2($elm$core$List$map, $elm$parser$Parser$problemToDeadEnd, problems));
		}
	});
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$FootnoteHelper$mdNextFootnoteNum = function (md) {
	var parsedNotes = A2($elm$parser$Parser$run, $author$project$FootnoteHelper$parseAll, md);
	if (!parsedNotes.$) {
		var n = parsedNotes.a;
		var sorted = $author$project$FootnoteHelper$Sorted(
			A2($elm$core$List$sortBy, $author$project$FootnoteHelper$getRank, n));
		return $elm$core$Result$Ok(
			$author$project$FootnoteHelper$nextNote(sorted));
	} else {
		var errors = parsedNotes.a;
		return $elm$core$Result$Err('parser error');
	}
};
var $elm$parser$Parser$ExpectingInt = {$: 1};
var $elm$parser$Parser$Advanced$consumeBase = _Parser_consumeBase;
var $elm$parser$Parser$Advanced$consumeBase16 = _Parser_consumeBase16;
var $elm$parser$Parser$Advanced$bumpOffset = F2(
	function (newOffset, s) {
		return {dN: s.dN + (newOffset - s.ej), e: s.e, g: s.g, ej: newOffset, eA: s.eA, a: s.a};
	});
var $elm$parser$Parser$Advanced$chompBase10 = _Parser_chompBase10;
var $elm$parser$Parser$Advanced$isAsciiCode = _Parser_isAsciiCode;
var $elm$parser$Parser$Advanced$consumeExp = F2(
	function (offset, src) {
		if (A3($elm$parser$Parser$Advanced$isAsciiCode, 101, offset, src) || A3($elm$parser$Parser$Advanced$isAsciiCode, 69, offset, src)) {
			var eOffset = offset + 1;
			var expOffset = (A3($elm$parser$Parser$Advanced$isAsciiCode, 43, eOffset, src) || A3($elm$parser$Parser$Advanced$isAsciiCode, 45, eOffset, src)) ? (eOffset + 1) : eOffset;
			var newOffset = A2($elm$parser$Parser$Advanced$chompBase10, expOffset, src);
			return _Utils_eq(expOffset, newOffset) ? (-newOffset) : newOffset;
		} else {
			return offset;
		}
	});
var $elm$parser$Parser$Advanced$consumeDotAndExp = F2(
	function (offset, src) {
		return A3($elm$parser$Parser$Advanced$isAsciiCode, 46, offset, src) ? A2(
			$elm$parser$Parser$Advanced$consumeExp,
			A2($elm$parser$Parser$Advanced$chompBase10, offset + 1, src),
			src) : A2($elm$parser$Parser$Advanced$consumeExp, offset, src);
	});
var $elm$parser$Parser$Advanced$finalizeInt = F5(
	function (invalid, handler, startOffset, _v0, s) {
		var endOffset = _v0.a;
		var n = _v0.b;
		if (handler.$ === 1) {
			var x = handler.a;
			return A2(
				$elm$parser$Parser$Advanced$Bad,
				true,
				A2($elm$parser$Parser$Advanced$fromState, s, x));
		} else {
			var toValue = handler.a;
			return _Utils_eq(startOffset, endOffset) ? A2(
				$elm$parser$Parser$Advanced$Bad,
				_Utils_cmp(s.ej, startOffset) < 0,
				A2($elm$parser$Parser$Advanced$fromState, s, invalid)) : A3(
				$elm$parser$Parser$Advanced$Good,
				true,
				toValue(n),
				A2($elm$parser$Parser$Advanced$bumpOffset, endOffset, s));
		}
	});
var $elm$parser$Parser$Advanced$fromInfo = F4(
	function (row, col, x, context) {
		return A2(
			$elm$parser$Parser$Advanced$AddRight,
			$elm$parser$Parser$Advanced$Empty,
			A4($elm$parser$Parser$Advanced$DeadEnd, row, col, x, context));
	});
var $elm$core$String$toFloat = _String_toFloat;
var $elm$parser$Parser$Advanced$finalizeFloat = F6(
	function (invalid, expecting, intSettings, floatSettings, intPair, s) {
		var intOffset = intPair.a;
		var floatOffset = A2($elm$parser$Parser$Advanced$consumeDotAndExp, intOffset, s.a);
		if (floatOffset < 0) {
			return A2(
				$elm$parser$Parser$Advanced$Bad,
				true,
				A4($elm$parser$Parser$Advanced$fromInfo, s.eA, s.dN - (floatOffset + s.ej), invalid, s.e));
		} else {
			if (_Utils_eq(s.ej, floatOffset)) {
				return A2(
					$elm$parser$Parser$Advanced$Bad,
					false,
					A2($elm$parser$Parser$Advanced$fromState, s, expecting));
			} else {
				if (_Utils_eq(intOffset, floatOffset)) {
					return A5($elm$parser$Parser$Advanced$finalizeInt, invalid, intSettings, s.ej, intPair, s);
				} else {
					if (floatSettings.$ === 1) {
						var x = floatSettings.a;
						return A2(
							$elm$parser$Parser$Advanced$Bad,
							true,
							A2($elm$parser$Parser$Advanced$fromState, s, invalid));
					} else {
						var toValue = floatSettings.a;
						var _v1 = $elm$core$String$toFloat(
							A3($elm$core$String$slice, s.ej, floatOffset, s.a));
						if (_v1.$ === 1) {
							return A2(
								$elm$parser$Parser$Advanced$Bad,
								true,
								A2($elm$parser$Parser$Advanced$fromState, s, invalid));
						} else {
							var n = _v1.a;
							return A3(
								$elm$parser$Parser$Advanced$Good,
								true,
								toValue(n),
								A2($elm$parser$Parser$Advanced$bumpOffset, floatOffset, s));
						}
					}
				}
			}
		}
	});
var $elm$parser$Parser$Advanced$number = function (c) {
	return function (s) {
		if (A3($elm$parser$Parser$Advanced$isAsciiCode, 48, s.ej, s.a)) {
			var zeroOffset = s.ej + 1;
			var baseOffset = zeroOffset + 1;
			return A3($elm$parser$Parser$Advanced$isAsciiCode, 120, zeroOffset, s.a) ? A5(
				$elm$parser$Parser$Advanced$finalizeInt,
				c.fh,
				c.fc,
				baseOffset,
				A2($elm$parser$Parser$Advanced$consumeBase16, baseOffset, s.a),
				s) : (A3($elm$parser$Parser$Advanced$isAsciiCode, 111, zeroOffset, s.a) ? A5(
				$elm$parser$Parser$Advanced$finalizeInt,
				c.fh,
				c.ei,
				baseOffset,
				A3($elm$parser$Parser$Advanced$consumeBase, 8, baseOffset, s.a),
				s) : (A3($elm$parser$Parser$Advanced$isAsciiCode, 98, zeroOffset, s.a) ? A5(
				$elm$parser$Parser$Advanced$finalizeInt,
				c.fh,
				c.dL,
				baseOffset,
				A3($elm$parser$Parser$Advanced$consumeBase, 2, baseOffset, s.a),
				s) : A6(
				$elm$parser$Parser$Advanced$finalizeFloat,
				c.fh,
				c.dZ,
				c.d8,
				c.d_,
				_Utils_Tuple2(zeroOffset, 0),
				s)));
		} else {
			return A6(
				$elm$parser$Parser$Advanced$finalizeFloat,
				c.fh,
				c.dZ,
				c.d8,
				c.d_,
				A3($elm$parser$Parser$Advanced$consumeBase, 10, s.ej, s.a),
				s);
		}
	};
};
var $elm$parser$Parser$Advanced$int = F2(
	function (expecting, invalid) {
		return $elm$parser$Parser$Advanced$number(
			{
				dL: $elm$core$Result$Err(invalid),
				dZ: expecting,
				d_: $elm$core$Result$Err(invalid),
				fc: $elm$core$Result$Err(invalid),
				d8: $elm$core$Result$Ok($elm$core$Basics$identity),
				fh: invalid,
				ei: $elm$core$Result$Err(invalid)
			});
	});
var $elm$parser$Parser$int = A2($elm$parser$Parser$Advanced$int, $elm$parser$Parser$ExpectingInt, $elm$parser$Parser$ExpectingInt);
var $author$project$Exposition$mkMediaName = function (exp) {
	var imageNames = A2(
		$elm$core$List$map,
		$elm$parser$Parser$run(
			A2(
				$elm$parser$Parser$keeper,
				A2(
					$elm$parser$Parser$ignorer,
					$elm$parser$Parser$succeed($elm$core$Basics$identity),
					$elm$parser$Parser$symbol('media')),
				$elm$parser$Parser$int)),
		A2(
			$elm$core$List$map,
			function ($) {
				return $.l;
			},
			exp.n));
	var maxImage = A3(
		$elm$core$List$foldr,
		F2(
			function (res, maxI) {
				if (!res.$) {
					var i = res.a;
					return A2($elm$core$Basics$max, maxI, i);
				} else {
					return maxI;
				}
			}),
		0,
		imageNames);
	return 'media' + $elm$core$String$fromInt(maxImage + 1);
};
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$regex$Regex$find = _Regex_findAtMost(_Regex_infinity);
var $elm$regex$Regex$never = _Regex_never;
var $author$project$Exposition$updateCaption = F3(
	function (name, cap, exp) {
		var ob = A2($author$project$Exposition$objectByNameOrId, name, exp);
		var _v0 = A2(
			$elm$core$Maybe$map,
			function (o) {
				return A2(
					$author$project$Exposition$replaceObject,
					_Utils_update(
						o,
						{X: cap}),
					exp);
			},
			ob);
		if (!_v0.$) {
			var e = _v0.a;
			return e;
		} else {
			return exp;
		}
	});
var $author$project$Exposition$parseToolCaptions = F2(
	function (md, exp) {
		var r = A2(
			$elm$core$Maybe$withDefault,
			$elm$regex$Regex$never,
			$elm$regex$Regex$fromString('!\\[([^\\]]*)\\]{([^}]*)}'));
		var matches = A2(
			$elm$core$List$map,
			function (m) {
				return m.cN;
			},
			A2($elm$regex$Regex$find, r, md));
		return A3(
			$elm$core$List$foldr,
			F2(
				function (m, e) {
					if ((((m.b && (!m.a.$)) && m.b.b) && (!m.b.a.$)) && (!m.b.b.b)) {
						var cap = m.a.a;
						var _v1 = m.b;
						var ob = _v1.a.a;
						return A3($author$project$Exposition$updateCaption, ob, cap, e);
					} else {
						return e;
					}
				}),
			exp,
			matches);
	});
var $elm$browser$Browser$Navigation$reload = _Browser_reload(false);
var $author$project$Exposition$removeObjectWithID = F2(
	function (id, exp) {
		return _Utils_update(
			exp,
			{
				n: A2(
					$elm$core$List$filter,
					function (m) {
						return !_Utils_eq(m.j, id);
					},
					exp.n)
			});
	});
var $author$project$Exposition$renameDuplicateMedia = function (exp) {
	var renameDuplicates = F2(
		function (e, m) {
			renameDuplicates:
			while (true) {
				if (!m.b) {
					return e;
				} else {
					var h = m.a;
					var t = m.b;
					if (A2(
						$elm$core$List$any,
						function (o) {
							return _Utils_eq(o.l, h.l);
						},
						A2($author$project$Exposition$removeObjectWithID, h.j, e).n)) {
						var newOb = _Utils_update(
							h,
							{
								l: $author$project$Exposition$mkMediaName(e)
							});
						var $temp$e = A2($author$project$Exposition$replaceObject, newOb, e),
							$temp$m = t;
						e = $temp$e;
						m = $temp$m;
						continue renameDuplicates;
					} else {
						var $temp$e = e,
							$temp$m = t;
						e = $temp$e;
						m = $temp$m;
						continue renameDuplicates;
					}
				}
			}
		});
	return A2(renameDuplicates, exp, exp.n);
};
var $elm$core$String$filter = _String_filter;
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $author$project$Exposition$toolOrLink = F2(
	function (_v0, mediaIds) {
		var imageIdx = _v0.a;
		var originalUrl = _v0.b;
		var _v1 = $elm$core$List$head(
			A2($elm$core$List$drop, imageIdx - 1, mediaIds));
		if (!_v1.$) {
			var i = _v1.a;
			return '!{' + ($elm$core$String$fromInt(i) + '}');
		} else {
			return '![]' + (originalUrl + ')');
		}
	});
var $author$project$Exposition$replaceImagesWithTools = F2(
	function (md, mediaIds) {
		var r = $elm$regex$Regex$fromString('![[^]*](\\([^)]+)\\){[^}]+}');
		if (r.$ === 1) {
			return '';
		} else {
			var reg = r.a;
			return A3(
				$elm$regex$Regex$replace,
				reg,
				function (m) {
					var _v1 = m.cN;
					if (_v1.b && (!_v1.a.$)) {
						var sub = _v1.a.a;
						var fname = $elm$core$List$head(
							$elm$core$List$reverse(
								A2($elm$core$String$split, '/', sub)));
						if (fname.$ === 1) {
							return '';
						} else {
							var f = fname.a;
							var _v3 = $elm$core$String$toInt(
								A2($elm$core$String$filter, $elm$core$Char$isDigit, f));
							if (_v3.$ === 1) {
								return '';
							} else {
								var i = _v3.a;
								return A2(
									$author$project$Exposition$toolOrLink,
									_Utils_Tuple2(i, sub),
									mediaIds);
							}
						}
					} else {
						return '';
					}
				},
				md);
		}
	});
var $elm$json$Json$Encode$bool = _Json_wrap;
var $author$project$Main$reportIsSaved = _Platform_outgoingPort('reportIsSaved', $elm$json$Json$Encode$bool);
var $author$project$RCAPI$saveExposition = F2(
	function (exposition, expect) {
		var url = 'text-editor/save' + ('?research=' + ($elm$core$String$fromInt(exposition.j) + ('&weave=' + $elm$core$String$fromInt(exposition.dR))));
		var encodedToc = A2(
			$elm$json$Json$Encode$encode,
			0,
			A2(
				$elm$json$Json$Encode$list,
				function (te) {
					return $elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'level',
								$elm$json$Json$Encode$int(te.fj)),
								_Utils_Tuple2(
								'title',
								$elm$json$Json$Encode$string(te.dC)),
								_Utils_Tuple2(
								'id',
								$elm$json$Json$Encode$string(te.j))
							]));
				},
				exposition.dD));
		return $elm$http$Http$request(
			{
				K: $elm$http$Http$multipartBody(
					_List_fromArray(
						[
							A2($elm$http$Http$stringPart, 'html', exposition.cF),
							A2($elm$http$Http$stringPart, 'markdown', exposition.a7),
							A2($elm$http$Http$stringPart, 'style', exposition.c4),
							A2($elm$http$Http$stringPart, 'title', exposition.dC),
							A2(
							$elm$http$Http$stringPart,
							'media',
							A2(
								$elm$json$Json$Encode$encode,
								0,
								A2(
									$elm$json$Json$Encode$list,
									function (m) {
										return $elm$json$Json$Encode$object(
											_List_fromArray(
												[
													_Utils_Tuple2(
													'id',
													$elm$json$Json$Encode$int(m.j)),
													_Utils_Tuple2(
													'userClass',
													$elm$json$Json$Encode$string(m.W))
												]));
									},
									exposition.n))),
							A2(
							$elm$http$Http$stringPart,
							'metadata',
							A2(
								$elm$json$Json$Encode$encode,
								0,
								$elm$json$Json$Encode$object(
									_List_fromArray(
										[
											_Utils_Tuple2(
											'editorVersion',
											$elm$json$Json$Encode$string($author$project$Settings$editorVersion)),
											_Utils_Tuple2(
											'contentVersion',
											$elm$json$Json$Encode$int(exposition.bP))
										])))),
							A2($elm$http$Http$stringPart, 'toc', encodedToc)
						])),
				N: $elm$http$Http$expectString(expect),
				au: _List_fromArray(
					[
						A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
					]),
				aB: 'POST',
				aK: $elm$core$Maybe$Nothing,
				aL: $elm$core$Maybe$Nothing,
				V: url
			});
	});
var $author$project$Main$selectedEditorIsMedia = function (model) {
	var _v0 = model.p;
	if (_v0.a === 2) {
		var _v1 = _v0.a;
		return true;
	} else {
		return false;
	}
};
var $author$project$Main$setContent = _Platform_outgoingPort('setContent', $elm$core$Basics$identity);
var $author$project$Main$setDocumentTitle = _Platform_outgoingPort('setDocumentTitle', $elm$json$Json$Encode$string);
var $author$project$Main$setFullscreenMode = _Platform_outgoingPort('setFullscreenMode', $elm$json$Json$Encode$bool);
var $author$project$Main$setPreviewContent = _Platform_outgoingPort('setPreviewContent', $elm$json$Json$Encode$string);
var $author$project$Problems$splitResultListAcc = F3(
	function (results, problems, oks) {
		splitResultListAcc:
		while (true) {
			if (!results.b) {
				return _Utils_Tuple2(problems, oks);
			} else {
				if (!results.a.$) {
					var a = results.a.a;
					var rest = results.b;
					var $temp$results = rest,
						$temp$problems = problems,
						$temp$oks = A2($elm$core$List$cons, a, oks);
					results = $temp$results;
					problems = $temp$problems;
					oks = $temp$oks;
					continue splitResultListAcc;
				} else {
					var p = results.a.a;
					var rest = results.b;
					var $temp$results = rest,
						$temp$problems = A2($elm$core$List$cons, p, problems),
						$temp$oks = oks;
					results = $temp$results;
					problems = $temp$problems;
					oks = $temp$oks;
					continue splitResultListAcc;
				}
			}
		}
	});
var $author$project$Problems$splitResultList = function (results) {
	return A3($author$project$Problems$splitResultListAcc, results, _List_Nil, _List_Nil);
};
var $author$project$RCAPI$decodeMedia = function (exp) {
	var mediaField = function () {
		var _v0 = exp.n;
		if (!_v0.$) {
			var s = _v0.a;
			var _v1 = A2(
				$elm$json$Json$Decode$decodeString,
				$elm$json$Json$Decode$list($author$project$RCAPI$apiAdditionalMediaMetadata),
				s);
			if (!_v1.$) {
				var data = _v1.a;
				return $author$project$RCAPI$Right(data);
			} else {
				return $author$project$RCAPI$Left(s);
			}
		} else {
			var d = _v0.a;
			return $author$project$RCAPI$Right(d);
		}
	}();
	return _Utils_update(
		exp,
		{n: mediaField});
};
var $author$project$RCAPI$decodeMetadata = function (exp) {
	var metadataField = function () {
		var _v0 = exp.ca;
		if (!_v0.$) {
			var s = _v0.a;
			var _v1 = A2($elm$json$Json$Decode$decodeString, $author$project$RCAPI$apiExpositionMetadata, s);
			if (!_v1.$) {
				var data = _v1.a;
				return $author$project$RCAPI$Right(data);
			} else {
				return $author$project$RCAPI$Left(s);
			}
		} else {
			var d = _v0.a;
			return $author$project$RCAPI$Right(d);
		}
	}();
	return _Utils_update(
		exp,
		{ca: metadataField});
};
var $author$project$RCAPI$toMediaClassesDict = function (apiExpo) {
	var exp = $author$project$RCAPI$decodeMetadata(
		$author$project$RCAPI$decodeMedia(apiExpo));
	var _v0 = exp.n;
	if (_v0.$ === 1) {
		var lst = _v0.a;
		return $elm$core$Result$Ok(
			$elm$core$Dict$fromList(
				A2(
					$elm$core$List$filterMap,
					function (m) {
						var _v1 = m.W;
						if (!_v1.$) {
							var cl = _v1.a;
							return $elm$core$Maybe$Just(
								_Utils_Tuple2(m.j, cl));
						} else {
							return $elm$core$Maybe$Nothing;
						}
					},
					lst)));
	} else {
		return $elm$core$Result$Err($elm$core$Dict$empty);
	}
};
var $author$project$RCAPI$getMetadata = function (exp) {
	var _v0 = exp.ca;
	if (!_v0.$) {
		var s = _v0.a;
		return {bP: 0, dV: $author$project$Settings$editorVersion};
	} else {
		var d = _v0.a;
		return d;
	}
};
var $author$project$RCAPI$toRCExposition = F3(
	function (apiExpo, id, weave) {
		var exp = $author$project$RCAPI$decodeMetadata(
			$author$project$RCAPI$decodeMedia(apiExpo));
		var md = ($author$project$RCAPI$getMetadata(exp).dV < '2.0.0') ? _Utils_ap('# ' + (apiExpo.dC + '\n\n'), apiExpo.fk) : apiExpo.fk;
		return {
			dK: _List_Nil,
			bP: $author$project$RCAPI$getMetadata(exp).bP,
			c4: apiExpo.eK,
			dR: weave,
			dV: $author$project$Settings$editorVersion,
			j: id,
			a7: md,
			n: _List_Nil,
			cF: apiExpo.da,
			dC: apiExpo.dC,
			dD: _List_Nil
		};
	});
var $author$project$Exposition$NotTranscoded = function (a) {
	return {$: 1, a: a};
};
var $author$project$Exposition$Transcoded = {$: 0};
var $author$project$Problems$UnknownType = function (a) {
	return {$: 13, a: a};
};
var $author$project$RCAPI$getDimensions = function (media) {
	var _v0 = _Utils_Tuple2(media.e_, media.d0);
	if ((!_v0.a.$) && (!_v0.b.$)) {
		var w = _v0.a.a;
		var h = _v0.b.a;
		return $elm$core$Maybe$Just(
			_Utils_Tuple2(w, h));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Exposition$RCAudio = function (a) {
	return {$: 1, a: a};
};
var $author$project$Exposition$RCImage = {$: 4};
var $author$project$Exposition$RCPdf = {$: 3};
var $author$project$Exposition$RCVideo = function (a) {
	return {$: 0, a: a};
};
var $author$project$Exposition$Auto = 0;
var $author$project$Exposition$defaultPlayerSettings = {bF: false, b7: false, cr: 0};
var $author$project$RCAPI$getType = function (media) {
	var _v0 = media.b8;
	switch (_v0) {
		case 'image':
			return $elm$core$Result$Ok($author$project$Exposition$RCImage);
		case 'pdf':
			return $elm$core$Result$Ok($author$project$Exposition$RCPdf);
		case 'audio':
			return $elm$core$Result$Ok(
				$author$project$Exposition$RCAudio($author$project$Exposition$defaultPlayerSettings));
		case 'video':
			return $elm$core$Result$Ok(
				$author$project$Exposition$RCVideo($author$project$Exposition$defaultPlayerSettings));
		default:
			var str = _v0;
			return $elm$core$Result$Err('Unknown Media Type: ' + str);
	}
};
var $author$project$RCAPI$toRCMediaObject = F2(
	function (researchId, mediaEntry) {
		var stringToTranscoding = function (str) {
			if (str === 'Transcoded') {
				return $author$project$Exposition$Transcoded;
			} else {
				return $author$project$Exposition$NotTranscoded(str);
			}
		};
		var mediaT = $author$project$RCAPI$getType(mediaEntry.n);
		if (!mediaT.$) {
			var mtype = mediaT.a;
			return $elm$core$Result$Ok(
				{
					X: '',
					aU: mediaEntry.aU,
					aW: mediaEntry.aW,
					ar: $author$project$RCAPI$getDimensions(mediaEntry.n),
					bU: researchId,
					fd: '',
					j: mediaEntry.j,
					b5: mediaEntry.b5,
					b8: mtype,
					l: mediaEntry.l,
					eJ: stringToTranscoding(mediaEntry.n.eJ),
					W: '',
					eY: 0
				});
		} else {
			var s = mediaT.a;
			return $elm$core$Result$Err(
				$author$project$Problems$UnknownType(s));
		}
	});
var $author$project$RCMediaList$update = F2(
	function (message, model) {
		switch (message.$) {
			case 0:
				var string = message.a;
				return _Utils_update(
					model,
					{cC: string});
			case 1:
				var state = message.a;
				return _Utils_update(
					model,
					{cM: state});
			default:
				var id = message.a;
				var newId = function () {
					var _v1 = model.aF;
					if (!_v1.$) {
						var currentId = _v1.a;
						return _Utils_eq(id, currentId) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(id);
					} else {
						return $elm$core$Maybe$Just(id);
					}
				}();
				return _Utils_update(
					model,
					{aF: newId});
		}
	});
var $author$project$Main$updateEditorContent = function (model) {
	return $author$project$Main$setContent(
		$elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'md',
					$elm$json$Json$Encode$string(model.b.a7)),
					_Utils_Tuple2(
					'style',
					$elm$json$Json$Encode$string(model.b.c4))
				])));
};
var $author$project$Util$snd = function (_v0) {
	var a = _v0.a;
	var b = _v0.b;
	return b;
};
var $author$project$Licenses$asString = function (l) {
	return A2(
		$elm$core$Maybe$withDefault,
		'all-rights-reserved',
		A2(
			$elm$core$Maybe$map,
			$author$project$Util$snd,
			A2(
				$author$project$Util$find,
				function (_v0) {
					var lic = _v0.a;
					return _Utils_eq(lic, l);
				},
				$author$project$Licenses$licensesDict)));
};
var $author$project$RCAPI$withDefault = F2(
	function (_default, str) {
		return (str === '') ? _default : str;
	});
var $author$project$RCAPI$updateMedia = F2(
	function (mediaObject, expect) {
		return $elm$http$Http$request(
			{
				K: $elm$http$Http$multipartBody(
					_List_fromArray(
						[
							A2($elm$http$Http$stringPart, 'name', mediaObject.l),
							A2(
							$elm$http$Http$stringPart,
							'copyrightholder',
							A2($author$project$RCAPI$withDefault, 'copyright holder', mediaObject.aU)),
							A2($elm$http$Http$stringPart, 'description', mediaObject.aW),
							A2(
							$elm$http$Http$stringPart,
							'license',
							$author$project$Licenses$asString(mediaObject.b5))
						])),
				N: expect,
				au: _List_fromArray(
					[
						A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
					]),
				aB: 'POST',
				aK: $elm$core$Maybe$Nothing,
				aL: $elm$core$Maybe$Nothing,
				V: 'text-editor/simple-media-edit' + ('?research=' + ($elm$core$String$fromInt(mediaObject.bU) + ('&simple-media=' + $elm$core$String$fromInt(mediaObject.j))))
			});
	});
var $author$project$RCMediaEdit$showWithObject = F3(
	function (obj, state, allowInsert) {
		return {
			bB: allowInsert,
			eg: $elm$core$Maybe$Just(obj),
			eh: $elm$core$Maybe$Just(state),
			cZ: $rundis$elm_bootstrap$Bootstrap$Modal$shown
		};
	});
var $author$project$Exposition$thumbUrl = function (data) {
	return '/text-editor/simple-media-thumb?research=' + ($elm$core$String$fromInt(data.bU) + ('&simple-media=' + ($elm$core$String$fromInt(data.j) + '&width=132&height=132')));
};
var $author$project$Exposition$validateCopyright = function (copyright) {
	if (copyright === '') {
		return $elm$core$Result$Err('copyright is obligatory');
	} else {
		var something = copyright;
		return $elm$core$Result$Ok(something);
	}
};
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Exposition$validateName = F3(
	function (exp, obj, newName) {
		if ($elm$core$String$length(newName) < 4) {
			return $elm$core$Result$Err('Name is too short');
		} else {
			var objName = obj.l;
			var mediaNames = A2(
				$elm$core$List$map,
				function (m) {
					return m.l;
				},
				exp.n);
			return (_Utils_eq(obj.l, newName) || (!A2($elm$core$List$member, newName, mediaNames))) ? (A2($elm$core$String$all, $elm$core$Char$isAlphaNum, newName) ? $elm$core$Result$Ok(newName) : $elm$core$Result$Err('The name must only contain alphanumeric characters.')) : $elm$core$Result$Err('Another media object already has this name.');
		}
	});
var $author$project$Exposition$validateMediaObject = F3(
	function (exp, objInModel, objInEdit) {
		var validation = {
			aU: $author$project$Exposition$validateCopyright(objInEdit.aU),
			aW: $elm$core$Result$Ok(objInEdit.aW),
			b5: $elm$core$Result$Ok(
				$author$project$Licenses$asString(objInEdit.b5)),
			l: A3($author$project$Exposition$validateName, exp, objInModel, objInEdit.l),
			W: $elm$core$Result$Ok(objInEdit.W)
		};
		return {
			j: objInModel.j,
			eP: $author$project$Exposition$thumbUrl(objInModel),
			eX: validation
		};
	});
var $author$project$Main$updateMediaDialog = F3(
	function (model, allowInsert, mediaNameOrId) {
		var _v0 = A2($author$project$Exposition$objectByNameOrId, mediaNameOrId, model.b);
		if (!_v0.$) {
			var obj = _v0.a;
			var viewObjectState = A3($author$project$Exposition$validateMediaObject, model.b, obj, obj);
			return _Utils_update(
				model,
				{
					D: A3($author$project$RCMediaEdit$showWithObject, obj, viewObjectState, allowInsert)
				});
		} else {
			var modelWithProblem = A2(
				$author$project$Main$addProblem,
				model,
				$author$project$Problems$NoMediaWithNameOrId(mediaNameOrId));
			return _Utils_update(
				modelWithProblem,
				{D: $author$project$RCMediaEdit$empty});
		}
	});
var $author$project$Exposition$TOCEntry = F3(
	function (level, title, id) {
		return {j: id, fj: level, dC: title};
	});
var $author$project$Exposition$makeTocEntries = function (lst) {
	makeTocEntries:
	while (true) {
		if (!lst.b) {
			return _List_Nil;
		} else {
			switch (lst.a.a) {
				case 'h1':
					var _v1 = lst.a;
					var title = _v1.b;
					var id = _v1.c;
					var rest = lst.b;
					return A2(
						$elm$core$List$cons,
						A3($author$project$Exposition$TOCEntry, 1, title, id),
						$author$project$Exposition$makeTocEntries(rest));
				case 'h2':
					var _v2 = lst.a;
					var title = _v2.b;
					var id = _v2.c;
					var rest = lst.b;
					return A2(
						$elm$core$List$cons,
						A3($author$project$Exposition$TOCEntry, 2, title, id),
						$author$project$Exposition$makeTocEntries(rest));
				case 'h3':
					var _v3 = lst.a;
					var title = _v3.b;
					var id = _v3.c;
					var rest = lst.b;
					return A2(
						$elm$core$List$cons,
						A3($author$project$Exposition$TOCEntry, 3, title, id),
						$author$project$Exposition$makeTocEntries(rest));
				default:
					var rest = lst.b;
					var $temp$lst = rest;
					lst = $temp$lst;
					continue makeTocEntries;
			}
		}
	}
};
var $author$project$Exposition$updateToc = F2(
	function (expo, tocJs) {
		return _Utils_update(
			expo,
			{
				dD: $author$project$Exposition$makeTocEntries(tocJs)
			});
	});
var $author$project$RCAPI$APIPandocImport = F2(
	function (media, markdown) {
		return {fk: markdown, n: media};
	});
var $author$project$RCAPI$apiPandocImport = A3(
	$elm$json$Json$Decode$map2,
	$author$project$RCAPI$APIPandocImport,
	A2(
		$elm$json$Json$Decode$field,
		'media',
		$elm$json$Json$Decode$list($elm$json$Json$Decode$int)),
	A2($elm$json$Json$Decode$field, 'markdown', $elm$json$Json$Decode$string));
var $elm$http$Http$filePart = _Http_pair;
var $author$project$RCAPI$uploadImport = F3(
	function (researchId, file, expectMsg) {
		return $elm$http$Http$request(
			{
				K: $elm$http$Http$multipartBody(
					_List_fromArray(
						[
							A2($elm$http$Http$filePart, 'file', file)
						])),
				N: A2($elm$http$Http$expectJson, expectMsg, $author$project$RCAPI$apiPandocImport),
				au: _List_fromArray(
					[
						A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
					]),
				aB: 'POST',
				aK: $elm$core$Maybe$Nothing,
				aL: $elm$core$Maybe$Just('uploadImport'),
				V: 'text-editor/import' + ('?research=' + $elm$core$String$fromInt(researchId))
			});
	});
var $author$project$RCAPI$MAudio = 0;
var $author$project$RCAPI$MImage = 2;
var $author$project$RCAPI$MPdf = 3;
var $author$project$RCAPI$MVideo = 1;
var $elm$file$File$mime = _File_mime;
var $author$project$RCAPI$mediaType = function (f) {
	var _v0 = $elm$file$File$mime(f);
	switch (_v0) {
		case 'image/gif':
			return $elm$core$Maybe$Just(2);
		case 'image/jpg':
			return $elm$core$Maybe$Just(2);
		case 'image/jpeg':
			return $elm$core$Maybe$Just(2);
		case 'image/png':
			return $elm$core$Maybe$Just(2);
		case 'image/tiff':
			return $elm$core$Maybe$Just(2);
		case 'image/svg+xml':
			return $elm$core$Maybe$Just(2);
		case 'audio/mp3':
			return $elm$core$Maybe$Just(0);
		case 'audio/wav':
			return $elm$core$Maybe$Just(0);
		case 'audio/x-wav':
			return $elm$core$Maybe$Just(0);
		case 'audio/mpeg':
			return $elm$core$Maybe$Just(0);
		case 'audio/ogg':
			return $elm$core$Maybe$Just(0);
		case 'audio/aiff':
			return $elm$core$Maybe$Just(0);
		case 'audio/x-aiff':
			return $elm$core$Maybe$Just(0);
		case 'video/mp4':
			return $elm$core$Maybe$Just(1);
		case 'video/mpeg':
			return $elm$core$Maybe$Just(1);
		case 'video/ogv':
			return $elm$core$Maybe$Just(1);
		case 'application/pdf':
			return $elm$core$Maybe$Just(3);
		case 'video/quicktime':
			return $elm$core$Maybe$Just(1);
		case 'audio/x-m4a':
			return $elm$core$Maybe$Just(0);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $author$project$RCAPI$stringOfUploadMediaType = function (t) {
	switch (t) {
		case 0:
			return 'audio';
		case 1:
			return 'video';
		case 2:
			return 'image';
		case 3:
			return 'pdf';
		default:
			return 'image';
	}
};
var $author$project$RCAPI$uploadMedia = F5(
	function (researchId, mediaName, file, expect, badFileTypeMsg) {
		var mediaT = $author$project$RCAPI$mediaType(file);
		if (mediaT.$ === 1) {
			return A2(
				$elm$core$Task$perform,
				function (_v1) {
					return badFileTypeMsg(
						$elm$file$File$mime(file));
				},
				$elm$time$Time$now);
		} else {
			var m = mediaT.a;
			return $elm$http$Http$request(
				{
					K: $elm$http$Http$multipartBody(
						_List_fromArray(
							[
								A2(
								$elm$http$Http$stringPart,
								'mediatype',
								$author$project$RCAPI$stringOfUploadMediaType(m)),
								A2($elm$http$Http$stringPart, 'name', mediaName),
								A2($elm$http$Http$stringPart, 'copyrightholder', 'copyright holder'),
								A2($elm$http$Http$stringPart, 'description', 'description'),
								A2($elm$http$Http$stringPart, 'license', 'all-rights-reserved'),
								A2($elm$http$Http$filePart, 'media', file)
							])),
					N: expect,
					au: _List_fromArray(
						[
							A2($elm$http$Http$header, 'X-Requested-With', 'XMLHttpRequest')
						]),
					aB: 'POST',
					aK: $elm$core$Maybe$Nothing,
					aL: $elm$core$Maybe$Just('uploadMedia'),
					V: 'text-editor/simple-media-add' + ('?research=' + $elm$core$String$fromInt(researchId))
				});
		}
	});
var $author$project$Main$uploadMediaFilePrompt = A2(
	$elm$file$File$Select$file,
	_List_fromArray(
		['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/svg+xml', 'audio/mp3', 'audio/wav', 'audio/aiff', 'application/pdf', 'audio/ogg', 'audio/aif', 'video/mp4', 'video/mpeg', 'video/ogv', 'video/quicktime']),
	$author$project$Main$UploadMediaFileSelected);
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 4:
					var convObj = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: A2(
									$author$project$Exposition$updateToc,
									A2($author$project$Exposition$withHtml, model.b, convObj.da),
									convObj.dD)
							}),
						$author$project$Main$setPreviewContent(convObj.da));
				case 0:
					var val = msg.a;
					var _v1 = A2($elm$json$Json$Decode$decodeValue, $author$project$Main$decodeGeneration, val);
					if (!_v1.$) {
						var gen = _v1.a;
						return (!_Utils_eq(gen, model.aY)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									aY: gen,
									b: $author$project$Exposition$incContentVersion(model.b),
									R: false
								}),
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$reportIsSaved(false),
										$author$project$Main$getContent(0)
									]))) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 1:
					var val = msg.a;
					var _v2 = _Utils_Tuple3(
						A2(
							$elm$json$Json$Decode$decodeValue,
							A2($elm$json$Json$Decode$field, 'generation', $author$project$Main$decodeGeneration),
							val),
						A2(
							$elm$json$Json$Decode$decodeValue,
							A2($elm$json$Json$Decode$field, 'md', $elm$json$Json$Decode$string),
							val),
						A2(
							$elm$json$Json$Decode$decodeValue,
							A2($elm$json$Json$Decode$field, 'style', $elm$json$Json$Decode$string),
							val));
					if (((!_v2.a.$) && (!_v2.b.$)) && (!_v2.c.$)) {
						var gen = _v2.a.a;
						var mdcontent = _v2.b.a;
						var stylecontent = _v2.c.a;
						var expoCaptions = A2($author$project$Exposition$parseToolCaptions, mdcontent, model.b);
						var newHtml = A2($author$project$Exposition$insertToolHtml, mdcontent, expoCaptions);
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									aY: gen,
									b: A2(
										$author$project$Exposition$withCSS,
										A2(
											$author$project$Exposition$withHtml,
											A2($author$project$Exposition$withMd, model.b, mdcontent),
											newHtml),
										stylecontent)
								}),
							$author$project$Main$convertMarkdown(newHtml));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 3:
					var val = msg.a;
					var _v3 = A2(
						$elm$json$Json$Decode$decodeValue,
						A2($elm$json$Json$Decode$field, 'media', $elm$json$Json$Decode$string),
						val);
					if (!_v3.$) {
						var mediaNameOrId = _v3.a;
						return _Utils_Tuple2(
							A3($author$project$Main$updateMediaDialog, model, false, mediaNameOrId),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(
							A2($author$project$Main$addProblem, model, $author$project$Problems$CannotFindMediaFieldInJson),
							$elm$core$Platform$Cmd$none);
					}
				case 2:
					var allowInsert = msg.a;
					var mediaNameOrId = msg.b;
					return _Utils_Tuple2(
						A3($author$project$Main$updateMediaDialog, model, allowInsert, mediaNameOrId),
						$elm$core$Platform$Cmd$none);
				case 8:
					return $author$project$Main$forceRerender(
						_Utils_update(
							model,
							{D: $author$project$RCMediaEdit$empty}));
				case 9:
					var exp = msg.a;
					if (!exp.$) {
						var e = exp.a;
						var newExposition = A3($author$project$RCAPI$toRCExposition, e, model.s, model.aO);
						var mediaClassesDict = $author$project$RCAPI$toMediaClassesDict(e);
						var newModel = function () {
							if (!mediaClassesDict.$) {
								var dict = mediaClassesDict.a;
								return _Utils_update(
									model,
									{b: newExposition, ae: dict});
							} else {
								var emptyDict = mediaClassesDict.a;
								var problemModel = A2($author$project$Main$addProblem, model, $author$project$Problems$MediaUserClassesProblem);
								return _Utils_update(
									problemModel,
									{b: newExposition, ae: emptyDict});
							}
						}();
						return _Utils_Tuple2(
							newModel,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$updateEditorContent(newModel),
										A2($author$project$RCAPI$getMediaList, model.s, $author$project$Main$GotMediaList),
										$author$project$Main$setDocumentTitle(newModel.b.dC)
									])));
					} else {
						var err = exp.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$CannotLoadExposition(err)),
							$elm$core$Platform$Cmd$none);
					}
				case 20:
					return (!model.R) ? _Utils_Tuple2(
						model,
						A2($author$project$RCAPI$saveExposition, model.b, $author$project$Main$SavedExposition)) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 21:
					var result = msg.a;
					if (!result.$) {
						var r = result.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{R: true}),
							$author$project$Main$reportIsSaved(true));
					} else {
						var s = result.a;
						if ((s.$ === 3) && (s.a === 401)) {
							return _Utils_Tuple2(model, $elm$browser$Browser$Navigation$reload);
						} else {
							return _Utils_Tuple2(
								A2($author$project$Main$addProblem, model, $author$project$Problems$CannotSave),
								$elm$core$Platform$Cmd$none);
						}
					}
				case 10:
					var mediaResult = msg.a;
					if (mediaResult.$ === 1) {
						var err = mediaResult.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$CannotLoadMedia(err)),
							$elm$core$Platform$Cmd$none);
					} else {
						var media = mediaResult.a;
						var _v9 = $author$project$Problems$splitResultList(
							A2(
								$elm$core$List$map,
								$author$project$RCAPI$toRCMediaObject(model.s),
								media));
						var problems = _v9.a;
						var mediaEntries = _v9.b;
						var modelWithProblems = A2($author$project$Main$addProblems, model, problems);
						var expositionWithMedia = A3($elm$core$List$foldr, $author$project$Exposition$addOrReplaceObject, modelWithProblems.b, mediaEntries);
						var expositionWithClasses = $author$project$Exposition$renameDuplicateMedia(
							A2($author$project$Exposition$addMediaUserClasses, expositionWithMedia, model.ae));
						return _Utils_Tuple2(
							_Utils_update(
								modelWithProblems,
								{b: expositionWithClasses}),
							$elm$core$Platform$Cmd$batch(
								_Utils_ap(
									_List_fromArray(
										[
											$author$project$Main$setContent(
											$elm$json$Json$Encode$object(
												_List_fromArray(
													[
														_Utils_Tuple2(
														'md',
														$elm$json$Json$Encode$string(expositionWithClasses.a7)),
														_Utils_Tuple2(
														'style',
														$elm$json$Json$Encode$string(expositionWithClasses.c4))
													]))),
											$author$project$Main$setPreviewContent(expositionWithClasses.cF)
										]),
									A2(
										$elm$core$List$map,
										function (o) {
											return A2(
												$author$project$RCAPI$updateMedia,
												o,
												$elm$http$Http$expectString($author$project$Main$SavedMediaEdit));
										},
										expositionWithClasses.n))));
					}
				case 11:
					var id = msg.a;
					var mediaList = msg.b;
					var canInsert = !$author$project$Main$selectedEditorIsMedia(model);
					var _v10 = A2(
						$author$project$Main$update,
						$author$project$Main$GotMediaList(mediaList),
						model);
					var modelWithNewMedia = _v10.a;
					var $temp$msg = A2($author$project$Main$MediaDialog, canInsert, id),
						$temp$model = modelWithNewMedia;
					msg = $temp$msg;
					model = $temp$model;
					continue update;
				case 5:
					var _v11 = msg.a;
					var objInModelName = _v11.a;
					var objFromDialog = _v11.b;
					var _v12 = A2($author$project$Exposition$objectByNameOrId, objInModelName, model.b);
					if (_v12.$ === 1) {
						var modelWithProblem = A2(
							$author$project$Main$addProblem,
							model,
							$author$project$Problems$NoMediaWithNameOrId(objInModelName));
						return _Utils_Tuple2(modelWithProblem, $elm$core$Platform$Cmd$none);
					} else {
						var objInModel = _v12.a;
						var objViewState = A3($author$project$Exposition$validateMediaObject, model.b, objInModel, objFromDialog);
						var dialog = model.D;
						var _v13 = $author$project$Exposition$isValid(objViewState.eX);
						if (!_v13) {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										D: _Utils_update(
											dialog,
											{
												eg: $elm$core$Maybe$Just(objFromDialog),
												eh: $elm$core$Maybe$Just(objViewState)
											})
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var newModel = _Utils_update(
								model,
								{
									b: A2($author$project$Exposition$replaceObject, objFromDialog, model.b),
									ae: A3(
										$elm$core$Dict$update,
										objFromDialog.j,
										$elm$core$Maybe$map(
											function (_v14) {
												return objFromDialog.W;
											}),
										model.ae),
									D: _Utils_update(
										dialog,
										{
											eg: $elm$core$Maybe$Just(objFromDialog),
											eh: $elm$core$Maybe$Just(objViewState)
										})
								});
							return _Utils_Tuple2(
								_Utils_update(
									newModel,
									{R: false}),
								A2(
									$author$project$RCAPI$updateMedia,
									objFromDialog,
									$elm$http$Http$expectString($author$project$Main$SavedMediaEdit)));
						}
					}
				case 22:
					var obj = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{R: false}),
						A2(
							$author$project$RCAPI$updateMedia,
							obj,
							$elm$http$Http$expectString($author$project$Main$SavedMediaEdit)));
				case 23:
					var result = msg.a;
					if (!result.$) {
						var s = result.a;
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var e = result.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$CannotUpdateMedia(e)),
							$elm$core$Platform$Cmd$none);
					}
				case 7:
					var obj = msg.a;
					var modelWithoutObj = _Utils_update(
						model,
						{
							b: A2($author$project$Exposition$removeObjectWithID, obj.j, model.b)
						});
					var _v16 = A2($author$project$Main$update, $author$project$Main$CloseConfirmDialog, modelWithoutObj);
					var modelWithClosedWindow = _v16.a;
					var cmd = _v16.b;
					return _Utils_Tuple2(
						modelWithClosedWindow,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									cmd,
									A2($author$project$RCAPI$deleteMedia, obj, $author$project$Main$MediaDeleted)
								])));
				case 28:
					var obj = msg.a;
					return _Utils_Tuple2(
						model,
						A2($author$project$RCAPI$getMediaList, model.s, $author$project$Main$GotMediaList));
				case 12:
					return _Utils_Tuple2(
						model,
						A2(
							$elm$file$File$Select$file,
							_List_fromArray(
								['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/svg+xml', 'audio/mp3', 'audio/wav', 'audio/aiff', 'application/pdf', 'audio/ogg', 'audio/aif', 'video/mp4', 'video/mpeg', 'video/ogv', 'video/quicktime', 'audio/x-m4a']),
							$author$project$Main$UploadMediaFileSelected));
				case 13:
					var file = msg.a;
					return _Utils_Tuple2(
						model,
						A5(
							$author$project$RCAPI$uploadMedia,
							model.s,
							$author$project$Exposition$mkMediaName(model.b),
							file,
							$elm$http$Http$expectString($author$project$Main$Uploaded),
							$author$project$Main$BadUploadFileType));
				case 14:
					return _Utils_Tuple2(
						model,
						A2(
							$elm$file$File$Select$file,
							_List_fromArray(
								['application/vnd.oasis.opendocument.text', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/x-tex', 'text/plain', 'text/html', 'application/xhtml+xml', 'text/markdown', 'text/x-markdown', 'text/x-org']),
							$author$project$Main$UploadImportFileSelected));
				case 15:
					var file = msg.a;
					return _Utils_Tuple2(
						model,
						A3($author$project$RCAPI$uploadImport, model.s, file, $author$project$Main$UploadedImport));
				case 33:
					var ctype = msg.a;
					return _Utils_Tuple2(
						model,
						A3($author$project$RCAPI$convertExposition, ctype, model.b, $author$project$Main$DownloadExport));
				case 32:
					var ctype = msg.a;
					var result = msg.b;
					if (result.$ === 1) {
						var err = result.a;
						return _Utils_Tuple2(
							A2($author$project$Main$addProblem, model, $author$project$Problems$ExportFailed),
							$elm$core$Platform$Cmd$none);
					} else {
						var bytes = result.a;
						return _Utils_Tuple2(
							model,
							A2($author$project$RCAPI$downloadExport, ctype, bytes));
					}
				case 16:
					var progress = msg.a;
					if (!progress.$) {
						var p = progress.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									aA: $author$project$Main$Uploading(
										$elm$http$Http$fractionSent(p))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 17:
					var progress = msg.a;
					if (!progress.$) {
						var p = progress.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									a1: $author$project$Main$Uploading(
										$elm$http$Http$fractionSent(p))
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 18:
					var result = msg.a;
					if (!result.$) {
						var apiMedia = result.a;
						var decoded = A2($elm$json$Json$Decode$decodeString, $author$project$RCAPI$apiMediaEntry, apiMedia);
						if (!decoded.$) {
							var media = decoded.a;
							var id = $elm$core$String$fromInt(
								function ($) {
									return $.j;
								}(media));
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{aA: $author$project$Main$Ready}),
								A2(
									$author$project$RCAPI$getMediaList,
									model.s,
									$author$project$Main$OpenNewMediaGotMediaList(id)));
						} else {
							var e = decoded.a;
							return _Utils_Tuple2(
								A2(
									$author$project$Main$addProblem,
									model,
									$author$project$Problems$DecodingJsonError(e)),
								A2($author$project$RCAPI$getMediaList, model.s, $author$project$Main$GotMediaList));
						}
					} else {
						var e = result.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$MediaUploadFailed(e)),
							$elm$core$Platform$Cmd$none);
					}
				case 19:
					var result = msg.a;
					if (!result.$) {
						var importResult = result.a;
						var newModel = _Utils_update(
							model,
							{
								b: A2(
									$author$project$Exposition$withMd,
									model.b,
									A2(
										$author$project$Exposition$replaceImagesWithTools,
										_Utils_ap(model.b.a7, importResult.fk),
										importResult.n)),
								a1: $author$project$Main$Ready
							});
						return _Utils_Tuple2(
							newModel,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$updateEditorContent(newModel),
										A2($author$project$RCAPI$getMediaList, model.s, $author$project$Main$GotMediaList)
									])));
					} else {
						var e = result.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$CannotImportFile(e)),
							$elm$core$Platform$Cmd$none);
					}
				case 24:
					var object = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								aq: $author$project$Main$confirmObjectDelete(object)
							}),
						$elm$core$Platform$Cmd$none);
				case 25:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aq: $author$project$UserConfirm$empty}),
						$elm$core$Platform$Cmd$none);
				case 26:
					var tab = msg.a;
					var _v23 = model.p;
					var mdEditor = _v23.b;
					var newModel = _Utils_update(
						model,
						{
							p: _Utils_Tuple2(tab, mdEditor)
						});
					return _Utils_Tuple2(
						newModel,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									A2($author$project$RCAPI$getMediaList, model.s, $author$project$Main$GotMediaList),
									$author$project$Main$setEditor(
									$author$project$Main$enumTabState(
										$author$project$Main$getTabState(newModel.p)))
								])));
				case 27:
					var state = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{bb: state}),
						$elm$core$Platform$Cmd$none);
				case 29:
					var visibility = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{am: visibility}),
						$elm$core$Platform$Cmd$none);
				case 30:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{H: _List_Nil}),
						$elm$core$Platform$Cmd$none);
				case 31:
					var editor = msg.a;
					var _v24 = model.p;
					var tab = _v24.a;
					var newModel = _Utils_update(
						model,
						{
							p: _Utils_Tuple2(tab, editor)
						});
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$setEditor(
							$author$project$Main$enumTabState(
								$author$project$Main$getTabState(newModel.p))));
				case 36:
					var obj = msg.a;
					return A2($author$project$Main$insertMediaUpdate, obj, model);
				case 34:
					var insertTuple = msg.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$insertMdString(insertTuple));
				case 35:
					var nextNumber = $author$project$FootnoteHelper$mdNextFootnoteNum(model.b.a7);
					if (!nextNumber.$) {
						var num = nextNumber.a;
						return _Utils_Tuple2(
							model,
							$author$project$Main$insertFootnote(
								$author$project$FootnoteHelper$footnoteSnippet(num)));
					} else {
						var err = nextNumber.a;
						return _Utils_Tuple2(
							A2(
								$author$project$Main$addProblem,
								model,
								$author$project$Problems$FootnoteHelperError(err)),
							$elm$core$Platform$Cmd$none);
					}
				case 6:
					var message = msg.a;
					if (!message.$) {
						var tableMsg = message.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									a8: A2($author$project$RCMediaList$update, tableMsg, model.a8)
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var action = message.a;
						switch (action.$) {
							case 2:
								var showInsert = action.a;
								var mediaNameOrId = action.b;
								return _Utils_Tuple2(
									A3($author$project$Main$updateMediaDialog, model, showInsert, mediaNameOrId),
									$elm$core$Platform$Cmd$none);
							case 24:
								var object = action.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											aq: $author$project$Main$confirmObjectDelete(object)
										}),
									$elm$core$Platform$Cmd$none);
							case 12:
								return _Utils_Tuple2(model, $author$project$Main$uploadMediaFilePrompt);
							default:
								return _Utils_Tuple2(
									A2(
										$author$project$Main$addProblem,
										model,
										$author$project$Problems$UnsupportedMessage('Media List button is doing something unexpected')),
									$elm$core$Platform$Cmd$none);
						}
					}
				case 37:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								r: _Utils_Tuple2(model.r.a, $rundis$elm_bootstrap$Bootstrap$Modal$shown)
							}),
						$elm$core$Platform$Cmd$none);
				case 38:
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								r: _Utils_Tuple2(model.r.a, $rundis$elm_bootstrap$Bootstrap$Modal$hidden)
							}),
						$elm$core$Platform$Cmd$none);
				case 39:
					var pickerMsg = msg.a;
					if (!pickerMsg.$) {
						var tableMsg = pickerMsg.a;
						var _v29 = model.r;
						var pickerModel = _v29.a;
						var visibility = _v29.b;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									r: _Utils_Tuple2(
										A2($author$project$RCMediaList$update, tableMsg, pickerModel),
										visibility)
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						var normalMsg = pickerMsg.a;
						switch (normalMsg.$) {
							case 36:
								var obj = normalMsg.a;
								return A2($author$project$Main$insertMediaUpdate, obj, model);
							case 37:
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											r: _Utils_Tuple2(model.r.a, $rundis$elm_bootstrap$Bootstrap$Modal$shown)
										}),
									$elm$core$Platform$Cmd$none);
							case 38:
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											r: _Utils_Tuple2(model.r.a, $rundis$elm_bootstrap$Bootstrap$Modal$hidden)
										}),
									$elm$core$Platform$Cmd$none);
							case 12:
								return _Utils_Tuple2(model, $author$project$Main$uploadMediaFilePrompt);
							default:
								return _Utils_Tuple2(
									A2(
										$author$project$Main$addProblem,
										model,
										$author$project$Problems$UnsupportedMessage('media insert is doing something unexpected')),
									$elm$core$Platform$Cmd$none);
						}
					}
				case 40:
					var state = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aZ: state}),
						$elm$core$Platform$Cmd$none);
				case 41:
					var str = msg.a;
					return _Utils_Tuple2(
						A2(
							$author$project$Main$addProblem,
							model,
							$author$project$Problems$UnkownUploadFileType(str)),
						$elm$core$Platform$Cmd$none);
				case 42:
					return _Utils_Tuple2(
						model,
						$author$project$Main$cmUndo(0));
				case 43:
					return _Utils_Tuple2(
						model,
						$author$project$Main$cmRedo(0));
				case 44:
					var title = msg.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$setDocumentTitle(title));
				default:
					var isFull = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{bV: isFull}),
						$author$project$Main$setFullscreenMode(isFull));
			}
		}
	});
var $author$project$Main$CloseMediaDialog = {$: 8};
var $author$project$Main$ConvertExposition = function (a) {
	return {$: 33, a: a};
};
var $author$project$RCAPI$Docx = 1;
var $author$project$RCAPI$Epub = 6;
var $author$project$View$EyeIcon = 12;
var $author$project$RCAPI$Html = 4;
var $author$project$View$ImportIcon = 1;
var $author$project$Main$InsertMediaAtCursor = function (a) {
	return {$: 36, a: a};
};
var $author$project$RCAPI$Latex = 3;
var $author$project$RCAPI$Md = 5;
var $author$project$Main$MediaList = function (a) {
	return {$: 6, a: a};
};
var $author$project$Main$MediaPicker = function (a) {
	return {$: 39, a: a};
};
var $author$project$RCAPI$Odt = 2;
var $author$project$RCAPI$Pdf = 0;
var $author$project$View$UploadCloud = 11;
var $author$project$Main$UploadImportFileSelect = {$: 14};
var $author$project$Main$UploadMediaFileSelect = {$: 12};
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $author$project$View$NoIcon = 13;
var $author$project$View$defaultButton = function (message) {
	return {d1: false, i: 13, ej: false, w: message, dj: _List_Nil, ep: false, aI: '', dC: 'button'};
};
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $author$project$Main$MediaEdit = function (a) {
	return {$: 5, a: a};
};
var $author$project$Main$makeMediaEditFun = F3(
	function (obj, field, input) {
		var objId = function ($) {
			return $.j;
		}(obj);
		switch (field) {
			case 0:
				return $author$project$Main$MediaEdit(
					_Utils_Tuple2(
						$elm$core$String$fromInt(objId),
						_Utils_update(
							obj,
							{l: input})));
			case 1:
				return $author$project$Main$MediaEdit(
					_Utils_Tuple2(
						$elm$core$String$fromInt(objId),
						_Utils_update(
							obj,
							{aW: input})));
			case 2:
				return $author$project$Main$MediaEdit(
					_Utils_Tuple2(
						$elm$core$String$fromInt(objId),
						_Utils_update(
							obj,
							{W: input})));
			case 3:
				return $author$project$Main$MediaEdit(
					_Utils_Tuple2(
						$elm$core$String$fromInt(objId),
						_Utils_update(
							obj,
							{aU: input})));
			default:
				return $author$project$Main$MediaEdit(
					_Utils_Tuple2(
						$elm$core$String$fromInt(objId),
						_Utils_update(
							obj,
							{
								b5: $author$project$Licenses$fromString(input)
							})));
		}
	});
var $author$project$Main$CloseMediaPicker = {$: 38};
var $author$project$Main$makePickerConfig = function (uploadButtonHtml) {
	return {e5: $author$project$Main$CloseMediaPicker, d7: $author$project$Main$InsertMediaAtCursor, eW: uploadButtonHtml};
};
var $author$project$Main$ConfirmMediaDelete = function (a) {
	return {$: 24, a: a};
};
var $author$project$Main$makeTableMessages = function (uploadButtonHtml) {
	return {
		e8: $author$project$Main$ConfirmMediaDelete,
		e9: $author$project$Main$MediaDialog(false),
		d7: $author$project$Main$InsertMediaAtCursor,
		eW: uploadButtonHtml
	};
};
var $elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var $elm$html$Html$map = $elm$virtual_dom$VirtualDom$map;
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mb1 = $elm$html$Html$Attributes$class('mb-1');
var $author$project$RCMediaList$MainMessage = function (a) {
	return {$: 1, a: a};
};
var $author$project$RCMediaList$MediaTable = 1;
var $billstclair$elm_sortable_table$Table$Config = $elm$core$Basics$identity;
var $billstclair$elm_sortable_table$Table$customConfig = function (_v0) {
	var toId = _v0.eQ;
	var toMsg = _v0.eR;
	var columns = _v0.dP;
	var customizations = _v0.dS;
	return {
		dP: A2(
			$elm$core$List$map,
			function (_v1) {
				var cData = _v1;
				return cData;
			},
			columns),
		dS: customizations,
		eQ: toId,
		eR: toMsg
	};
};
var $billstclair$elm_sortable_table$Table$simpleRowAttrs = function (_v0) {
	return _List_Nil;
};
var $billstclair$elm_sortable_table$Table$HtmlDetails = F2(
	function (attributes, children) {
		return {aQ: attributes, aS: children};
	});
var $elm$core$Char$fromCode = _Char_fromCode;
var $elm$core$String$fromList = _String_fromList;
var $billstclair$elm_sortable_table$Table$nbsp = $elm$core$String$fromList(
	_List_fromArray(
		[
			$elm$core$Char$fromCode(160)
		]));
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $billstclair$elm_sortable_table$Table$darkGrey = function (symbol) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'color', '#555')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(
				_Utils_ap($billstclair$elm_sortable_table$Table$nbsp, symbol))
			]));
};
var $billstclair$elm_sortable_table$Table$lightGrey = function (symbol) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'color', '#ccc')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(
				_Utils_ap($billstclair$elm_sortable_table$Table$nbsp, symbol))
			]));
};
var $elm$html$Html$th = _VirtualDom_node('th');
var $billstclair$elm_sortable_table$Table$simpleTheadHelp = function (_v0) {
	var name = _v0.a;
	var status = _v0.b;
	var click = _v0.c;
	var content = function () {
		switch (status.$) {
			case 0:
				return _List_fromArray(
					[
						$elm$html$Html$text(name)
					]);
			case 1:
				var selected = status.a;
				return _List_fromArray(
					[
						$elm$html$Html$text(name),
						selected ? $billstclair$elm_sortable_table$Table$darkGrey('↓') : $billstclair$elm_sortable_table$Table$lightGrey('↓')
					]);
			default:
				if (status.a.$ === 1) {
					var _v2 = status.a;
					return _List_fromArray(
						[
							$elm$html$Html$text(name),
							$billstclair$elm_sortable_table$Table$lightGrey('↕')
						]);
				} else {
					var isReversed = status.a.a;
					return _List_fromArray(
						[
							$elm$html$Html$text(name),
							$billstclair$elm_sortable_table$Table$darkGrey(
							isReversed ? '↑' : '↓')
						]);
				}
		}
	}();
	return A2(
		$elm$html$Html$th,
		_List_fromArray(
			[click]),
		content);
};
var $billstclair$elm_sortable_table$Table$simpleThead = function (headers) {
	return A2(
		$billstclair$elm_sortable_table$Table$HtmlDetails,
		_List_Nil,
		A2($elm$core$List$map, $billstclair$elm_sortable_table$Table$simpleTheadHelp, headers));
};
var $billstclair$elm_sortable_table$Table$defaultCustomizations = {X: $elm$core$Maybe$Nothing, eB: $billstclair$elm_sortable_table$Table$simpleRowAttrs, eM: _List_Nil, dz: _List_Nil, dA: $elm$core$Maybe$Nothing, dB: $billstclair$elm_sortable_table$Table$simpleThead};
var $author$project$RCMediaList$SetTableState = function (a) {
	return {$: 1, a: a};
};
var $author$project$RCMediaList$SortableTableMessage = function (a) {
	return {$: 0, a: a};
};
var $author$project$RCMediaList$makeTableMsg = A2($elm$core$Basics$composeL, $author$project$RCMediaList$SortableTableMessage, $author$project$RCMediaList$SetTableState);
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Attrs = function (a) {
	return {$: 4, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Button$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Internal$Button$Attrs(attrs_);
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$applyModifier = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 0:
				var size = modifier.a;
				return _Utils_update(
					options,
					{
						eG: $elm$core$Maybe$Just(size)
					});
			case 1:
				var coloring = modifier.a;
				return _Utils_update(
					options,
					{
						L: $elm$core$Maybe$Just(coloring)
					});
			case 2:
				return _Utils_update(
					options,
					{bH: true});
			case 3:
				var val = modifier.a;
				return _Utils_update(
					options,
					{bT: val});
			default:
				var attrs = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs)
					});
		}
	});
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$defaultOptions = {aQ: _List_Nil, bH: false, L: $elm$core$Maybe$Nothing, bT: false, eG: $elm$core$Maybe$Nothing};
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$roleClass = function (role) {
	switch (role) {
		case 0:
			return 'primary';
		case 1:
			return 'secondary';
		case 2:
			return 'success';
		case 3:
			return 'info';
		case 4:
			return 'warning';
		case 5:
			return 'danger';
		case 6:
			return 'dark';
		case 7:
			return 'light';
		default:
			return 'link';
	}
};
var $rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption = function (size) {
	switch (size) {
		case 0:
			return $elm$core$Maybe$Nothing;
		case 1:
			return $elm$core$Maybe$Just('sm');
		case 2:
			return $elm$core$Maybe$Just('md');
		case 3:
			return $elm$core$Maybe$Just('lg');
		default:
			return $elm$core$Maybe$Just('xl');
	}
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$buttonAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Internal$Button$applyModifier, $rundis$elm_bootstrap$Bootstrap$Internal$Button$defaultOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('btn', true),
						_Utils_Tuple2('btn-block', options.bH),
						_Utils_Tuple2('disabled', options.bT)
					])),
				$elm$html$Html$Attributes$disabled(options.bT)
			]),
		_Utils_ap(
			function () {
				var _v0 = A2($elm$core$Maybe$andThen, $rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption, options.eG);
				if (!_v0.$) {
					var s = _v0.a;
					return _List_fromArray(
						[
							$elm$html$Html$Attributes$class('btn-' + s)
						]);
				} else {
					return _List_Nil;
				}
			}(),
			_Utils_ap(
				function () {
					var _v1 = options.L;
					if (!_v1.$) {
						if (!_v1.a.$) {
							var role = _v1.a.a;
							return _List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'btn-' + $rundis$elm_bootstrap$Bootstrap$Internal$Button$roleClass(role))
								]);
						} else {
							var role = _v1.a.a;
							return _List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'btn-outline-' + $rundis$elm_bootstrap$Bootstrap$Internal$Button$roleClass(role))
								]);
						}
					} else {
						return _List_Nil;
					}
				}(),
				options.aQ)));
};
var $rundis$elm_bootstrap$Bootstrap$Button$button = F2(
	function (options, children) {
		return A2(
			$elm$html$Html$button,
			$rundis$elm_bootstrap$Bootstrap$Internal$Button$buttonAttributes(options),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml1 = $elm$html$Html$Attributes$class('ml-1');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring = function (a) {
	return {$: 1, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Danger = 5;
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined = function (a) {
	return {$: 1, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Button$outlineDanger = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(5));
var $rundis$elm_bootstrap$Bootstrap$General$Internal$SM = 1;
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Size = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Button$small = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Size(1);
var $author$project$RCMediaList$deleteButton = F2(
	function (messages, object) {
		var makeDeleteMessage = A2($elm$core$Basics$composeL, $author$project$RCMediaList$MainMessage, messages.e8);
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Button$button,
			_List_fromArray(
				[
					$rundis$elm_bootstrap$Bootstrap$Button$small,
					$rundis$elm_bootstrap$Bootstrap$Button$outlineDanger,
					$rundis$elm_bootstrap$Bootstrap$Button$attrs(
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml1,
							$elm$html$Html$Events$onClick(
							makeDeleteMessage(object))
						]))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Delete')
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Info = 3;
var $rundis$elm_bootstrap$Bootstrap$Button$outlineInfo = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(3));
var $author$project$RCMediaList$editButton = F2(
	function (messages, object) {
		var makeEditMessage = A2(
			$elm$core$Basics$composeL,
			A2(
				$elm$core$Basics$composeL,
				A2($elm$core$Basics$composeL, $author$project$RCMediaList$MainMessage, messages.e9),
				$elm$core$String$fromInt),
			function ($) {
				return $.j;
			});
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Button$button,
			_List_fromArray(
				[
					$rundis$elm_bootstrap$Bootstrap$Button$small,
					$rundis$elm_bootstrap$Bootstrap$Button$outlineInfo,
					$rundis$elm_bootstrap$Bootstrap$Button$attrs(
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml1,
							$elm$html$Html$Events$onClick(
							makeEditMessage(object))
						]))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Edit')
				]));
	});
var $author$project$RCMediaList$editObjectButtons = F2(
	function (messages, object) {
		return A2(
			$billstclair$elm_sortable_table$Table$HtmlDetails,
			_List_Nil,
			_List_fromArray(
				[
					A2($author$project$RCMediaList$editButton, messages, object),
					A2($author$project$RCMediaList$deleteButton, messages, object)
				]));
	});
var $billstclair$elm_sortable_table$Table$None = {$: 0};
var $billstclair$elm_sortable_table$Table$unsortable = $billstclair$elm_sortable_table$Table$None;
var $billstclair$elm_sortable_table$Table$Column = $elm$core$Basics$identity;
var $billstclair$elm_sortable_table$Table$veryCustomColumn = $elm$core$Basics$identity;
var $author$project$RCMediaList$mediaListButtons = function (messages) {
	return $billstclair$elm_sortable_table$Table$veryCustomColumn(
		{
			l: 'Action',
			dt: $billstclair$elm_sortable_table$Table$unsortable,
			dE: $author$project$RCMediaList$editObjectButtons(messages)
		});
};
var $elm$html$Html$Events$onDoubleClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'dblclick',
		$elm$json$Json$Decode$succeed(msg));
};
var $billstclair$elm_sortable_table$Table$IncOrDec = function (a) {
	return {$: 3, a: a};
};
var $billstclair$elm_sortable_table$Table$increasingOrDecreasingBy = function (toComparable) {
	return $billstclair$elm_sortable_table$Table$IncOrDec(
		$elm$core$List$sortBy(toComparable));
};
var $billstclair$elm_sortable_table$Table$textDetails = function (str) {
	return A2(
		$billstclair$elm_sortable_table$Table$HtmlDetails,
		_List_Nil,
		_List_fromArray(
			[
				$elm$html$Html$text(str)
			]));
};
var $billstclair$elm_sortable_table$Table$stringColumn = F2(
	function (name, toStr) {
		return {
			l: name,
			dt: $billstclair$elm_sortable_table$Table$increasingOrDecreasingBy(toStr),
			dE: A2($elm$core$Basics$composeL, $billstclair$elm_sortable_table$Table$textDetails, toStr)
		};
	});
var $author$project$RCMediaPreview$PreviewPlayer = 2;
var $author$project$RCMediaPreview$PreviewSmall = 1;
var $author$project$RCMediaList$SetPreviewMediaId = function (a) {
	return {$: 2, a: a};
};
var $author$project$Exposition$getMediaTypeString = A2(
	$elm$core$Basics$composeL,
	$author$project$Exposition$rcClass,
	function ($) {
		return $.b8;
	});
var $author$project$View$CameraIcon = 21;
var $author$project$View$SpeakerIcon = 20;
var $elm$html$Html$Attributes$alt = $elm$html$Html$Attributes$stringProperty('alt');
var $elm$html$Html$Attributes$height = function (n) {
	return A2(
		_VirtualDom_attribute,
		'height',
		$elm$core$String$fromInt(n));
};
var $author$project$Settings$baseUrl = 'elm-editor/';
var $author$project$Settings$iconUrl = $author$project$Settings$baseUrl + 'lib/icons/';
var $elm$html$Html$img = _VirtualDom_node('img');
var $elm$html$Html$Attributes$src = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var $elm$html$Html$Attributes$width = function (n) {
	return A2(
		_VirtualDom_attribute,
		'width',
		$elm$core$String$fromInt(n));
};
var $author$project$View$renderIcon = function (icon) {
	var iconImg = function (url) {
		return A2(
			$elm$html$Html$img,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$src(
					_Utils_ap($author$project$Settings$iconUrl, url)),
					$elm$html$Html$Attributes$class('m-1'),
					$elm$html$Html$Attributes$width(15),
					$elm$html$Html$Attributes$height(15),
					A2($elm$html$Html$Attributes$style, 'position', 'relative'),
					A2($elm$html$Html$Attributes$style, 'top', '-2px'),
					$elm$html$Html$Attributes$alt(
					A3($elm$core$String$slice, 0, -4, url))
				]),
			_List_Nil);
	};
	switch (icon) {
		case 13:
			return A2($elm$html$Html$div, _List_Nil, _List_Nil);
		case 0:
			return iconImg('plus.svg');
		case 1:
			return iconImg('import-export.svg');
		case 2:
			return iconImg('save.svg');
		case 3:
			return iconImg('italic.svg');
		case 4:
			return iconImg('link-intact.svg');
		case 5:
			return iconImg('bold.svg');
		case 8:
			return iconImg('list-unordered.svg');
		case 9:
			return iconImg('list-ordered.svg');
		case 7:
			return iconImg('header.svg');
		case 6:
			return iconImg('double-quote-sans-left.svg');
		case 10:
			return iconImg('arrow-down.svg');
		case 11:
			return iconImg('cloud-upload.svg');
		case 12:
			return iconImg('eye.svg');
		case 14:
			return iconImg('undo.svg');
		case 15:
			return iconImg('redo.svg');
		case 16:
			return iconImg('screen-full.svg');
		case 17:
			return iconImg('screen-normal.svg');
		case 18:
			return iconImg('file-media.svg');
		case 19:
			return iconImg('triangle-right.svg');
		case 20:
			return iconImg('unmute.svg');
		default:
			return iconImg('device-camera-video.svg');
	}
};
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$RCMediaPreview$renderAsIconHyperlink = F3(
	function (icon, object, clickAction) {
		return A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$title('preview audio ' + object.l),
					$elm$html$Html$Events$onClick(clickAction)
				]),
			_List_fromArray(
				[
					$author$project$View$renderIcon(icon)
				]));
	});
var $author$project$Exposition$customThumbUrl = F2(
	function (size, data) {
		var sizeStr = $elm$core$String$fromInt(size);
		return '/text-editor/simple-media-thumb?research=' + ($elm$core$String$fromInt(data.bU) + ('&simple-media=' + ($elm$core$String$fromInt(data.j) + ('&width=' + (sizeStr + ('&height=' + sizeStr))))));
	});
var $author$project$RCMediaPreview$getStyle = function (size) {
	switch (size) {
		case 0:
			return _List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'width', '100%'),
					A2($elm$html$Html$Attributes$style, 'height', '250px'),
					A2($elm$html$Html$Attributes$style, 'object-fit', 'cover')
				]);
		case 1:
			return _List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'width', '60px'),
					A2($elm$html$Html$Attributes$style, 'hieght', '60px'),
					A2($elm$html$Html$Attributes$style, 'object-fit', 'cover')
				]);
		default:
			return _List_Nil;
	}
};
var $author$project$RCMediaPreview$renderAsMini = F2(
	function (object, size) {
		var reso = function () {
			if (!size) {
				return 500;
			} else {
				return 120;
			}
		}();
		var thumburl = A2($author$project$Exposition$customThumbUrl, reso, object);
		return A2(
			$elm$html$Html$img,
			_Utils_ap(
				_List_fromArray(
					[
						$elm$html$Html$Attributes$src(thumburl)
					]),
				$author$project$RCMediaPreview$getStyle(size)),
			_List_Nil);
	});
var $author$project$View$TriangleRight = 19;
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$RCMediaPreview$renderMediaAsHyperlink = F2(
	function (typeString, object) {
		return A2(
			$elm$html$Html$span,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('rc-media-preview')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(typeString + ' '),
					A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$href(
							$author$project$Exposition$mediaUrl(object)),
							$elm$html$Html$Attributes$target('_blank'),
							$elm$html$Html$Attributes$title('open preview')
						]),
					_List_fromArray(
						[
							$author$project$View$renderIcon(19)
						]))
				]));
	});
var $elm$html$Html$audio = _VirtualDom_node('audio');
var $elm$html$Html$Attributes$autoplay = $elm$html$Html$Attributes$boolProperty('autoplay');
var $elm$html$Html$Attributes$controls = $elm$html$Html$Attributes$boolProperty('controls');
var $elm$html$Html$Attributes$loop = $elm$html$Html$Attributes$boolProperty('loop');
var $elm$html$Html$Attributes$preload = $elm$html$Html$Attributes$stringProperty('preload');
var $elm$html$Html$source = _VirtualDom_node('source');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$video = _VirtualDom_node('video');
var $author$project$RCMediaPreview$viewThumbnail = F2(
	function (object, size) {
		var _v0 = object.b8;
		switch (_v0.$) {
			case 4:
				var reso = function () {
					if (!size) {
						return 500;
					} else {
						return 120;
					}
				}();
				var thumburl = A2($author$project$Exposition$customThumbUrl, reso, object);
				return A2(
					$elm$html$Html$img,
					_Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$src(thumburl)
							]),
						$author$project$RCMediaPreview$getStyle(size)),
					_List_Nil);
			case 1:
				var settings = _v0.a;
				var audioUrl = $author$project$Exposition$mediaUrl(object);
				return A2(
					$elm$html$Html$audio,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$title('Preview'),
							$elm$html$Html$Attributes$controls(true),
							$elm$html$Html$Attributes$loop(settings.b7),
							$elm$html$Html$Attributes$autoplay(settings.bF),
							$elm$html$Html$Attributes$class('audio-preview'),
							$elm$html$Html$Attributes$preload('none'),
							A2($elm$html$Html$Attributes$style, 'width', '200px'),
							A2($elm$html$Html$Attributes$style, 'position', 'relative'),
							A2($elm$html$Html$Attributes$style, 'top', '0')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$source,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$src(audioUrl),
									$elm$html$Html$Attributes$type_('audio/mpeg')
								]),
							_List_Nil)
						]));
			case 0:
				var settings = _v0.a;
				var videoUrl = $author$project$Exposition$mediaUrl(object);
				return A2(
					$elm$html$Html$video,
					_Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$title('Preview'),
								$elm$html$Html$Attributes$controls(true),
								$elm$html$Html$Attributes$loop(settings.b7),
								$elm$html$Html$Attributes$autoplay(settings.bF),
								$elm$html$Html$Attributes$class('video-preview'),
								$elm$html$Html$Attributes$preload('none'),
								A2($elm$html$Html$Attributes$style, 'width', '200px'),
								A2($elm$html$Html$Attributes$style, 'position', 'relative'),
								A2($elm$html$Html$Attributes$style, 'top', '0')
							]),
						$author$project$RCMediaPreview$getStyle(size)),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$source,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$src(videoUrl),
									$elm$html$Html$Attributes$type_('video/mp4')
								]),
							_List_Nil)
						]));
			default:
				return A2(
					$elm$html$Html$span,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('No preview')
						]));
		}
	});
var $author$project$RCMediaPreview$viewTableThumbnail = F3(
	function (object, size, clickAction) {
		var _v0 = object.b8;
		switch (_v0.$) {
			case 4:
				return A2($author$project$RCMediaPreview$renderAsMini, object, size);
			case 2:
				return A2($author$project$RCMediaPreview$renderAsMini, object, size);
			case 1:
				var settings = _v0.a;
				var thumb = A2($author$project$RCMediaPreview$viewThumbnail, object, size);
				if (size === 2) {
					return A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A3($author$project$RCMediaPreview$renderAsIconHyperlink, 20, object, clickAction),
								thumb
							]));
				} else {
					return A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A3($author$project$RCMediaPreview$renderAsIconHyperlink, 20, object, clickAction)
							]));
				}
			case 0:
				var settings = _v0.a;
				var thumb = A2($author$project$RCMediaPreview$viewThumbnail, object, size);
				if (size === 2) {
					return A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A3($author$project$RCMediaPreview$renderAsIconHyperlink, 21, object, clickAction),
								thumb
							]));
				} else {
					return A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A3($author$project$RCMediaPreview$renderAsIconHyperlink, 21, object, clickAction)
							]));
				}
			default:
				return A2($author$project$RCMediaPreview$renderMediaAsHyperlink, 'PDF', object);
		}
	});
var $author$project$RCMediaList$thumbnailColumn = function (previewedMediaId) {
	return $billstclair$elm_sortable_table$Table$veryCustomColumn(
		{
			l: 'Preview',
			dt: $billstclair$elm_sortable_table$Table$increasingOrDecreasingBy($author$project$Exposition$getMediaTypeString),
			dE: function (rcObject) {
				var size = function () {
					if (!previewedMediaId.$) {
						var id = previewedMediaId.a;
						return _Utils_eq(id, rcObject.j) ? 2 : 1;
					} else {
						return 1;
					}
				}();
				var action = $author$project$RCMediaList$SortableTableMessage(
					$author$project$RCMediaList$SetPreviewMediaId(rcObject.j));
				return A2(
					$billstclair$elm_sortable_table$Table$HtmlDetails,
					_List_Nil,
					_List_fromArray(
						[
							A3($author$project$RCMediaPreview$viewTableThumbnail, rcObject, size, action)
						]));
			}
		});
};
var $author$project$RCMediaList$configMediaList = F2(
	function (previewedMediaId, messages) {
		var doubleClickAction = A2(
			$elm$core$Basics$composeL,
			A2(
				$elm$core$Basics$composeL,
				A2($elm$core$Basics$composeL, $author$project$RCMediaList$MainMessage, messages.e9),
				$elm$core$String$fromInt),
			function ($) {
				return $.j;
			});
		var buttons = $author$project$RCMediaList$mediaListButtons(messages);
		return $billstclair$elm_sortable_table$Table$customConfig(
			{
				dP: _List_fromArray(
					[
						$author$project$RCMediaList$thumbnailColumn(previewedMediaId),
						A2(
						$billstclair$elm_sortable_table$Table$stringColumn,
						'ID',
						A2(
							$elm$core$Basics$composeL,
							$elm$core$String$fromInt,
							function ($) {
								return $.j;
							})),
						A2(
						$billstclair$elm_sortable_table$Table$stringColumn,
						'Name',
						function ($) {
							return $.l;
						}),
						buttons
					]),
				dS: _Utils_update(
					$billstclair$elm_sortable_table$Table$defaultCustomizations,
					{
						eB: function (object) {
							return _List_fromArray(
								[
									$elm$html$Html$Attributes$class('rc-media-table-row'),
									$elm$html$Html$Events$onDoubleClick(
									doubleClickAction(object))
								]);
						},
						eM: _List_fromArray(
							[
								$elm$html$Html$Attributes$class('rc-media-table'),
								$elm$html$Html$Attributes$class('mt-1')
							])
					}),
				eQ: A2(
					$elm$core$Basics$composeL,
					$elm$core$String$fromInt,
					function ($) {
						return $.j;
					}),
				eR: $author$project$RCMediaList$makeTableMsg
			});
	});
var $author$project$RCMediaList$SetQuery = function (a) {
	return {$: 0, a: a};
};
var $elm$core$String$toLower = _String_toLower;
var $author$project$RCMediaList$filterObjectsByName = F2(
	function (query, lst) {
		if (query === '') {
			return lst;
		} else {
			var q = query;
			var lowerQuery = $elm$core$String$toLower(q);
			return A2(
				$elm$core$List$filter,
				A2(
					$elm$core$Basics$composeL,
					A2(
						$elm$core$Basics$composeL,
						$elm$core$String$contains(lowerQuery),
						$elm$core$String$toLower),
					function ($) {
						return $.l;
					}),
				lst);
		}
	});
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $rundis$elm_bootstrap$Bootstrap$Internal$Role$Info = 3;
var $rundis$elm_bootstrap$Bootstrap$Alert$Config = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Alert$attrs = F2(
	function (attributes, _v0) {
		var configRec = _v0;
		return _Utils_update(
			configRec,
			{aQ: attributes});
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$children = F2(
	function (children_, _v0) {
		var configRec = _v0;
		return _Utils_update(
			configRec,
			{aS: children_});
	});
var $rundis$elm_bootstrap$Bootstrap$Internal$Role$Secondary = 1;
var $rundis$elm_bootstrap$Bootstrap$Alert$config = {aQ: _List_Nil, aS: _List_Nil, Z: $elm$core$Maybe$Nothing, cG: 1, cZ: 0, al: false};
var $rundis$elm_bootstrap$Bootstrap$Alert$role = F2(
	function (role_, _v0) {
		var configRec = _v0;
		return _Utils_update(
			configRec,
			{cG: role_});
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$StartClose = 1;
var $rundis$elm_bootstrap$Bootstrap$Alert$clickHandler = F2(
	function (visibility, configRec) {
		var handleClick = F2(
			function (viz, toMsg) {
				return $elm$html$Html$Events$onClick(
					toMsg(viz));
			});
		var _v0 = configRec.Z;
		if (!_v0.$) {
			var dismissMsg = _v0.a;
			return _List_fromArray(
				[
					configRec.al ? A2(handleClick, 1, dismissMsg) : A2(handleClick, 3, dismissMsg)
				]);
		} else {
			return _List_Nil;
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$injectButton = F2(
	function (btn, children_) {
		if (children_.b) {
			var head = children_.a;
			var tail = children_.b;
			return A2(
				$elm$core$List$cons,
				head,
				A2($elm$core$List$cons, btn, tail));
		} else {
			return _List_fromArray(
				[btn]);
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$isDismissable = function (configRec) {
	var _v0 = configRec.Z;
	if (!_v0.$) {
		return true;
	} else {
		return false;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Alert$maybeAddDismissButton = F3(
	function (visibilty, configRec, children_) {
		return $rundis$elm_bootstrap$Bootstrap$Alert$isDismissable(configRec) ? A2(
			$rundis$elm_bootstrap$Bootstrap$Alert$injectButton,
			A2(
				$elm$html$Html$button,
				_Utils_ap(
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$class('close'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close')
						]),
					A2($rundis$elm_bootstrap$Bootstrap$Alert$clickHandler, visibilty, configRec)),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('×')
							]))
					])),
			children_) : children_;
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Role$toClass = F2(
	function (prefix, role) {
		return $elm$html$Html$Attributes$class(
			prefix + ('-' + function () {
				switch (role) {
					case 0:
						return 'primary';
					case 1:
						return 'secondary';
					case 2:
						return 'success';
					case 3:
						return 'info';
					case 4:
						return 'warning';
					case 5:
						return 'danger';
					case 6:
						return 'light';
					default:
						return 'dark';
				}
			}()));
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$viewAttributes = F2(
	function (visibility, configRec) {
		var visibiltyAttributes = (visibility === 3) ? _List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'display', 'none')
			]) : _List_Nil;
		var animationAttributes = function () {
			if (configRec.al) {
				var _v0 = configRec.Z;
				if (!_v0.$) {
					var dismissMsg = _v0.a;
					return _List_fromArray(
						[
							A2(
							$elm$html$Html$Events$on,
							'transitionend',
							$elm$json$Json$Decode$succeed(
								dismissMsg(3)))
						]);
				} else {
					return _List_Nil;
				}
			} else {
				return _List_Nil;
			}
		}();
		var alertAttributes = _List_fromArray(
			[
				A2($elm$html$Html$Attributes$attribute, 'role', 'alert'),
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('alert', true),
						_Utils_Tuple2(
						'alert-dismissible',
						$rundis$elm_bootstrap$Bootstrap$Alert$isDismissable(configRec)),
						_Utils_Tuple2('fade', configRec.al),
						_Utils_Tuple2('show', !visibility)
					])),
				A2($rundis$elm_bootstrap$Bootstrap$Internal$Role$toClass, 'alert', configRec.cG)
			]);
		return $elm$core$List$concat(
			_List_fromArray(
				[configRec.aQ, alertAttributes, visibiltyAttributes, animationAttributes]));
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$view = F2(
	function (visibility, _v0) {
		var configRec = _v0;
		return A2(
			$elm$html$Html$div,
			A2($rundis$elm_bootstrap$Bootstrap$Alert$viewAttributes, visibility, configRec),
			A3($rundis$elm_bootstrap$Bootstrap$Alert$maybeAddDismissButton, visibility, configRec, configRec.aS));
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$simple = F3(
	function (role_, attributes, children_) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Alert$view,
			0,
			A2(
				$rundis$elm_bootstrap$Bootstrap$Alert$children,
				children_,
				A2(
					$rundis$elm_bootstrap$Bootstrap$Alert$attrs,
					attributes,
					A2($rundis$elm_bootstrap$Bootstrap$Alert$role, role_, $rundis$elm_bootstrap$Bootstrap$Alert$config))));
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$simpleInfo = $rundis$elm_bootstrap$Bootstrap$Alert$simple(3);
var $elm$html$Html$caption = _VirtualDom_node('caption');
var $billstclair$elm_sortable_table$Table$applySorter = F3(
	function (isReversed, sorter, data) {
		switch (sorter.$) {
			case 0:
				return data;
			case 1:
				var srt = sorter.a;
				return srt(data);
			case 2:
				var srt = sorter.a;
				return $elm$core$List$reverse(
					srt(data));
			case 3:
				var srt = sorter.a;
				return isReversed ? $elm$core$List$reverse(
					srt(data)) : srt(data);
			default:
				var srt = sorter.a;
				return isReversed ? srt(data) : $elm$core$List$reverse(
					srt(data));
		}
	});
var $billstclair$elm_sortable_table$Table$findSorter = F2(
	function (selectedColumn, columnData) {
		findSorter:
		while (true) {
			if (!columnData.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var name = columnData.a.l;
				var sorter = columnData.a.dt;
				var remainingColumnData = columnData.b;
				if (_Utils_eq(name, selectedColumn)) {
					return $elm$core$Maybe$Just(sorter);
				} else {
					var $temp$selectedColumn = selectedColumn,
						$temp$columnData = remainingColumnData;
					selectedColumn = $temp$selectedColumn;
					columnData = $temp$columnData;
					continue findSorter;
				}
			}
		}
	});
var $billstclair$elm_sortable_table$Table$sort = F3(
	function (_v0, columnData, data) {
		var selectedColumn = _v0.a;
		var isReversed = _v0.b;
		var _v1 = A2($billstclair$elm_sortable_table$Table$findSorter, selectedColumn, columnData);
		if (_v1.$ === 1) {
			return data;
		} else {
			var sorter = _v1.a;
			return A3($billstclair$elm_sortable_table$Table$applySorter, isReversed, sorter, data);
		}
	});
var $billstclair$elm_sortable_table$Table$getSortedData = F3(
	function (_v0, state, data) {
		var toId = _v0.eQ;
		var toMsg = _v0.eR;
		var columns = _v0.dP;
		var customizations = _v0.dS;
		return A3($billstclair$elm_sortable_table$Table$sort, state, columns, data);
	});
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$Keyed$node = $elm$virtual_dom$VirtualDom$keyedNode;
var $elm$html$Html$table = _VirtualDom_node('table');
var $elm$html$Html$tfoot = _VirtualDom_node('tfoot');
var $elm$html$Html$thead = _VirtualDom_node('thead');
var $billstclair$elm_sortable_table$Table$Reversible = function (a) {
	return {$: 2, a: a};
};
var $billstclair$elm_sortable_table$Table$Sortable = function (a) {
	return {$: 1, a: a};
};
var $billstclair$elm_sortable_table$Table$Unsortable = {$: 0};
var $billstclair$elm_sortable_table$Table$onClick = F3(
	function (name, isReversed, toMsg) {
		return A2(
			$elm$html$Html$Events$on,
			'click',
			A2(
				$elm$json$Json$Decode$map,
				toMsg,
				A3(
					$elm$json$Json$Decode$map2,
					$billstclair$elm_sortable_table$Table$State,
					$elm$json$Json$Decode$succeed(name),
					$elm$json$Json$Decode$succeed(isReversed))));
	});
var $billstclair$elm_sortable_table$Table$toHeaderInfo = F3(
	function (_v0, toMsg, _v1) {
		var sortName = _v0.a;
		var isReversed = _v0.b;
		var name = _v1.l;
		var sorter = _v1.dt;
		switch (sorter.$) {
			case 0:
				return _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Unsortable,
					A3($billstclair$elm_sortable_table$Table$onClick, sortName, isReversed, toMsg));
			case 1:
				return _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Sortable(
						!_Utils_eq(name, sortName)),
					A3($billstclair$elm_sortable_table$Table$onClick, name, false, toMsg));
			case 2:
				return _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Sortable(
						_Utils_eq(name, sortName)),
					A3($billstclair$elm_sortable_table$Table$onClick, name, false, toMsg));
			case 3:
				return _Utils_eq(name, sortName) ? _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Reversible(
						$elm$core$Maybe$Just(!isReversed)),
					A3($billstclair$elm_sortable_table$Table$onClick, name, !isReversed, toMsg)) : _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Reversible($elm$core$Maybe$Nothing),
					A3($billstclair$elm_sortable_table$Table$onClick, name, false, toMsg));
			default:
				return _Utils_eq(name, sortName) ? _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Reversible(
						$elm$core$Maybe$Just(isReversed)),
					A3($billstclair$elm_sortable_table$Table$onClick, name, !isReversed, toMsg)) : _Utils_Tuple3(
					name,
					$billstclair$elm_sortable_table$Table$Reversible($elm$core$Maybe$Nothing),
					A3($billstclair$elm_sortable_table$Table$onClick, name, false, toMsg));
		}
	});
var $elm$html$Html$tr = _VirtualDom_node('tr');
var $elm$virtual_dom$VirtualDom$lazy3 = _VirtualDom_lazy3;
var $elm$html$Html$Lazy$lazy3 = $elm$virtual_dom$VirtualDom$lazy3;
var $elm$html$Html$td = _VirtualDom_node('td');
var $billstclair$elm_sortable_table$Table$viewCell = F2(
	function (data, _v0) {
		var viewData = _v0.dE;
		var details = viewData(data);
		return A2($elm$html$Html$td, details.aQ, details.aS);
	});
var $billstclair$elm_sortable_table$Table$viewRowHelp = F3(
	function (columns, toRowAttrs, data) {
		return A2(
			$elm$html$Html$tr,
			toRowAttrs(data),
			A2(
				$elm$core$List$map,
				$billstclair$elm_sortable_table$Table$viewCell(data),
				columns));
	});
var $billstclair$elm_sortable_table$Table$viewRow = F4(
	function (toId, columns, toRowAttrs, data) {
		return _Utils_Tuple2(
			toId(data),
			A4($elm$html$Html$Lazy$lazy3, $billstclair$elm_sortable_table$Table$viewRowHelp, columns, toRowAttrs, data));
	});
var $billstclair$elm_sortable_table$Table$view = F3(
	function (conf, state, data) {
		var toId = conf.eQ;
		var toMsg = conf.eR;
		var columns = conf.dP;
		var customizations = conf.dS;
		var theadDetails = customizations.dB(
			A2(
				$elm$core$List$map,
				A2($billstclair$elm_sortable_table$Table$toHeaderInfo, state, toMsg),
				columns));
		var thead = A2(
			$elm$html$Html$thead,
			theadDetails.aQ,
			_List_fromArray(
				[
					A2($elm$html$Html$tr, _List_Nil, theadDetails.aS)
				]));
		var sortedData = A3($billstclair$elm_sortable_table$Table$getSortedData, conf, state, data);
		var tbody = A3(
			$elm$html$Html$Keyed$node,
			'tbody',
			customizations.dz,
			A2(
				$elm$core$List$map,
				A3($billstclair$elm_sortable_table$Table$viewRow, toId, columns, customizations.eB),
				sortedData));
		var withFoot = function () {
			var _v1 = customizations.dA;
			if (_v1.$ === 1) {
				return A2($elm$core$List$cons, tbody, _List_Nil);
			} else {
				var attributes = _v1.a.aQ;
				var children = _v1.a.aS;
				return A2(
					$elm$core$List$cons,
					A2($elm$html$Html$tfoot, attributes, children),
					A2($elm$core$List$cons, tbody, _List_Nil));
			}
		}();
		return A2(
			$elm$html$Html$table,
			customizations.eM,
			function () {
				var _v0 = customizations.X;
				if (_v0.$ === 1) {
					return A2($elm$core$List$cons, thead, withFoot);
				} else {
					var attributes = _v0.a.aQ;
					var children = _v0.a.aS;
					return A2(
						$elm$core$List$cons,
						A2($elm$html$Html$caption, attributes, children),
						A2($elm$core$List$cons, thead, withFoot));
				}
			}());
	});
var $author$project$RCMediaList$view = F5(
	function (upload, tableType, _v0, tableConfig, objectList) {
		var query = _v0.cC;
		var state = _v0.cM;
		var searchBox = A2(
			$elm$html$Html$input,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('rc-media-table-searchbox'),
					$elm$html$Html$Attributes$placeholder('Search by name'),
					$elm$html$Html$Events$onInput(
					A2($elm$core$Basics$composeL, $author$project$RCMediaList$SortableTableMessage, $author$project$RCMediaList$SetQuery))
				]),
			_List_Nil);
		var tableControls = A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('mt-1')
				]),
			_List_fromArray(
				[upload, searchBox]));
		var domIdAndStyle = function () {
			if (!tableType) {
				return _List_fromArray(
					[
						$elm$html$Html$Attributes$id('media-picker'),
						A2($elm$html$Html$Attributes$style, 'display', 'initial')
					]);
			} else {
				return _List_fromArray(
					[
						$elm$html$Html$Attributes$id('media-list'),
						A2($elm$html$Html$Attributes$style, 'display', 'hidden')
					]);
			}
		}();
		if (!objectList.b) {
			return A2(
				$elm$html$Html$div,
				domIdAndStyle,
				_List_fromArray(
					[
						tableControls,
						A2(
						$rundis$elm_bootstrap$Bootstrap$Alert$simpleInfo,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Media list is empty. Hint: add a file by using the \"upload media\" button.')
							]))
					]));
		} else {
			var nonEmptyObjectList = objectList;
			var searchedObjects = A2($author$project$RCMediaList$filterObjectsByName, query, nonEmptyObjectList);
			if (!searchedObjects.b) {
				return A2(
					$elm$html$Html$div,
					domIdAndStyle,
					_List_fromArray(
						[
							tableControls,
							A2(
							$rundis$elm_bootstrap$Bootstrap$Alert$simpleInfo,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Cannot find any media named \"' + (query + '\"'))
								]))
						]));
			} else {
				var results = searchedObjects;
				return A2(
					$elm$html$Html$div,
					domIdAndStyle,
					_List_fromArray(
						[
							tableControls,
							A3($billstclair$elm_sortable_table$Table$view, tableConfig, state, results)
						]));
			}
		}
	});
var $author$project$RCMediaList$mediaListView = F3(
	function (model, objects, messages) {
		var uploadBtn = A2($elm$html$Html$map, $author$project$RCMediaList$MainMessage, messages.eW);
		return A5(
			$author$project$RCMediaList$view,
			uploadBtn,
			1,
			model,
			A2($author$project$RCMediaList$configMediaList, model.aF, messages),
			objects);
	});
var $author$project$RCMediaList$PickerTable = 0;
var $rundis$elm_bootstrap$Bootstrap$Modal$Config = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Modal$attrs = F2(
	function (values, _v0) {
		var conf = _v0;
		var options = conf.fr;
		return _Utils_update(
			conf,
			{
				fr: _Utils_update(
					options,
					{bE: values})
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$Body = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Modal$body = F3(
	function (attributes, children, _v0) {
		var conf = _v0;
		return _Utils_update(
			conf,
			{
				K: $elm$core$Maybe$Just(
					{aQ: attributes, aS: children})
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$config = function (closeMsg) {
	return {
		K: $elm$core$Maybe$Nothing,
		aT: closeMsg,
		c8: $elm$core$Maybe$Nothing,
		b1: $elm$core$Maybe$Nothing,
		fr: {bE: _List_Nil, bJ: true, a$: true, ba: $elm$core$Maybe$Nothing, cJ: false},
		al: $elm$core$Maybe$Nothing
	};
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Success = 2;
var $rundis$elm_bootstrap$Bootstrap$Button$outlineSuccess = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(2));
var $author$project$RCMediaList$insertButton = F2(
	function (messages, object) {
		var makeInsertMessage = A2($elm$core$Basics$composeL, $author$project$RCMediaList$MainMessage, messages.d7);
		return A2(
			$billstclair$elm_sortable_table$Table$HtmlDetails,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$rundis$elm_bootstrap$Bootstrap$Button$button,
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Button$small,
							$rundis$elm_bootstrap$Bootstrap$Button$outlineSuccess,
							$rundis$elm_bootstrap$Bootstrap$Button$attrs(
							_List_fromArray(
								[
									$elm$html$Html$Events$onClick(
									makeInsertMessage(object))
								]))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Insert')
						]))
				]));
	});
var $author$project$RCMediaList$pickerButton = function (messages) {
	return $billstclair$elm_sortable_table$Table$veryCustomColumn(
		{
			l: 'Edit',
			dt: $billstclair$elm_sortable_table$Table$unsortable,
			dE: $author$project$RCMediaList$insertButton(messages)
		});
};
var $author$project$RCMediaList$configMediaPicker = F2(
	function (previewedMediaId, messages) {
		var doubleClickAction = A2($elm$core$Basics$composeL, $author$project$RCMediaList$MainMessage, messages.d7);
		var buttons = $author$project$RCMediaList$pickerButton(messages);
		return $billstclair$elm_sortable_table$Table$customConfig(
			{
				dP: _List_fromArray(
					[
						$author$project$RCMediaList$thumbnailColumn(previewedMediaId),
						A2(
						$billstclair$elm_sortable_table$Table$stringColumn,
						'ID',
						A2(
							$elm$core$Basics$composeL,
							$elm$core$String$fromInt,
							function ($) {
								return $.j;
							})),
						A2(
						$billstclair$elm_sortable_table$Table$stringColumn,
						'Name',
						function ($) {
							return $.l;
						}),
						buttons
					]),
				dS: _Utils_update(
					$billstclair$elm_sortable_table$Table$defaultCustomizations,
					{
						eB: function (object) {
							return _List_fromArray(
								[
									$elm$html$Html$Attributes$class('rc-media-table-row'),
									$elm$html$Html$Events$onDoubleClick(
									doubleClickAction(object))
								]);
						},
						eM: _List_fromArray(
							[
								$elm$html$Html$Attributes$class('rc-media-table'),
								$elm$html$Html$Attributes$class('rc-media-picker'),
								$elm$html$Html$Attributes$class('mt-1')
							])
					}),
				eQ: A2(
					$elm$core$Basics$composeL,
					$elm$core$String$fromInt,
					function ($) {
						return $.j;
					}),
				eR: $author$project$RCMediaList$makeTableMsg
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$Footer = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Modal$footer = F3(
	function (attributes, children, _v0) {
		var conf = _v0;
		return _Utils_update(
			conf,
			{
				c8: $elm$core$Maybe$Just(
					{aQ: attributes, aS: children})
			});
	});
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $rundis$elm_bootstrap$Bootstrap$Modal$Header = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Modal$header = F3(
	function (attributes, children, _v0) {
		var conf = _v0;
		return _Utils_update(
			conf,
			{
				b1: $elm$core$Maybe$Just(
					{aQ: attributes, aS: children})
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$titledHeader = F3(
	function (itemFn, attributes, children) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Modal$header,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					itemFn,
					A2(
						$elm$core$List$cons,
						$elm$html$Html$Attributes$class('modal-title'),
						attributes),
					children)
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$h1 = $rundis$elm_bootstrap$Bootstrap$Modal$titledHeader($elm$html$Html$h1);
var $rundis$elm_bootstrap$Bootstrap$Modal$hideOnBackdropClick = F2(
	function (hide, _v0) {
		var conf = _v0;
		var options = conf.fr;
		return _Utils_update(
			conf,
			{
				fr: _Utils_update(
					options,
					{a$: hide})
			});
	});
var $rundis$elm_bootstrap$Bootstrap$General$Internal$LG = 3;
var $rundis$elm_bootstrap$Bootstrap$Modal$large = function (_v0) {
	var conf = _v0;
	var options = conf.fr;
	return _Utils_update(
		conf,
		{
			fr: _Utils_update(
				options,
				{
					ba: $elm$core$Maybe$Just(3)
				})
		});
};
var $rundis$elm_bootstrap$Bootstrap$Modal$scrollableBody = F2(
	function (scrollable, _v0) {
		var conf = _v0;
		var options = conf.fr;
		return _Utils_update(
			conf,
			{
				fr: _Utils_update(
					options,
					{cJ: scrollable})
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Roled = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Secondary = 1;
var $rundis$elm_bootstrap$Bootstrap$Button$secondary = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Roled(1));
var $rundis$elm_bootstrap$Bootstrap$Modal$StartClose = 1;
var $rundis$elm_bootstrap$Bootstrap$Modal$getCloseMsg = function (config_) {
	var _v0 = config_.al;
	if (!_v0.$) {
		var animationMsg = _v0.a;
		return animationMsg(1);
	} else {
		return config_.aT;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Modal$isFade = function (conf) {
	return A2(
		$elm$core$Maybe$withDefault,
		false,
		A2(
			$elm$core$Maybe$map,
			function (_v0) {
				return true;
			},
			conf.al));
};
var $rundis$elm_bootstrap$Bootstrap$Modal$backdrop = F2(
	function (visibility, conf) {
		var attributes = function () {
			switch (visibility) {
				case 0:
					return _Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('modal-backdrop', true),
										_Utils_Tuple2(
										'fade',
										$rundis$elm_bootstrap$Bootstrap$Modal$isFade(conf)),
										_Utils_Tuple2('show', true)
									]))
							]),
						conf.fr.a$ ? _List_fromArray(
							[
								$elm$html$Html$Events$onClick(
								$rundis$elm_bootstrap$Bootstrap$Modal$getCloseMsg(conf))
							]) : _List_Nil);
				case 1:
					return _List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('modal-backdrop', true),
									_Utils_Tuple2('fade', true),
									_Utils_Tuple2('show', true)
								]))
						]);
				case 2:
					return _List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('modal-backdrop', true),
									_Utils_Tuple2('fade', true),
									_Utils_Tuple2('show', false)
								]))
						]);
				default:
					return _List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('modal-backdrop', false),
									_Utils_Tuple2(
									'fade',
									$rundis$elm_bootstrap$Bootstrap$Modal$isFade(conf)),
									_Utils_Tuple2('show', false)
								]))
						]);
			}
		}();
		return _List_fromArray(
			[
				A2($elm$html$Html$div, attributes, _List_Nil)
			]);
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$className = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['className']),
	$elm$json$Json$Decode$string);
var $elm$json$Json$Decode$fail = _Json_fail;
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$target = function (decoder) {
	return A2($elm$json$Json$Decode$field, 'target', decoder);
};
var $rundis$elm_bootstrap$Bootstrap$Modal$containerClickDecoder = function (closeMsg) {
	return A2(
		$elm$json$Json$Decode$andThen,
		function (c) {
			return A2($elm$core$String$contains, 'elm-bootstrap-modal', c) ? $elm$json$Json$Decode$succeed(closeMsg) : $elm$json$Json$Decode$fail('ignoring');
		},
		$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$target($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$className));
};
var $rundis$elm_bootstrap$Bootstrap$Modal$display = F2(
	function (visibility, conf) {
		switch (visibility) {
			case 0:
				return _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'pointer-events', 'none'),
						A2($elm$html$Html$Attributes$style, 'display', 'block'),
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('modal', true),
								_Utils_Tuple2(
								'fade',
								$rundis$elm_bootstrap$Bootstrap$Modal$isFade(conf)),
								_Utils_Tuple2('show', true)
							]))
					]);
			case 1:
				return _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'pointer-events', 'none'),
						A2($elm$html$Html$Attributes$style, 'display', 'block'),
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('modal', true),
								_Utils_Tuple2('fade', true),
								_Utils_Tuple2('show', true)
							]))
					]);
			case 2:
				return _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'pointer-events', 'none'),
						A2($elm$html$Html$Attributes$style, 'display', 'block'),
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('modal', true),
								_Utils_Tuple2('fade', true),
								_Utils_Tuple2('show', false)
							])),
						A2(
						$elm$html$Html$Events$on,
						'transitionend',
						$elm$json$Json$Decode$succeed(conf.aT))
					]);
			default:
				return _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'height', '0px'),
						A2($elm$html$Html$Attributes$style, 'display', 'block'),
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('modal', true),
								_Utils_Tuple2(
								'fade',
								$rundis$elm_bootstrap$Bootstrap$Modal$isFade(conf)),
								_Utils_Tuple2('show', false)
							]))
					]);
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Modal$modalClass = function (size) {
	var _v0 = $rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(size);
	if (!_v0.$) {
		var s = _v0.a;
		return _List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-' + s)
			]);
	} else {
		return _List_Nil;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Modal$modalAttributes = function (options) {
	return _Utils_ap(
		options.bE,
		_Utils_ap(
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('modal-dialog', true),
							_Utils_Tuple2('modal-dialog-centered', options.bJ),
							_Utils_Tuple2('modal-dialog-scrollable', options.cJ)
						])),
					A2($elm$html$Html$Attributes$style, 'pointer-events', 'auto')
				]),
			A2(
				$elm$core$Maybe$withDefault,
				_List_Nil,
				A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Modal$modalClass, options.ba))));
};
var $rundis$elm_bootstrap$Bootstrap$Modal$renderBody = function (maybeBody) {
	if (!maybeBody.$) {
		var cfg = maybeBody.a;
		return $elm$core$Maybe$Just(
			A2(
				$elm$html$Html$div,
				A2(
					$elm$core$List$cons,
					$elm$html$Html$Attributes$class('modal-body'),
					cfg.aQ),
				cfg.aS));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Modal$renderFooter = function (maybeFooter) {
	if (!maybeFooter.$) {
		var cfg = maybeFooter.a;
		return $elm$core$Maybe$Just(
			A2(
				$elm$html$Html$div,
				A2(
					$elm$core$List$cons,
					$elm$html$Html$Attributes$class('modal-footer'),
					cfg.aQ),
				cfg.aS));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Modal$closeButton = function (closeMsg) {
	return A2(
		$elm$html$Html$button,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('close'),
				$elm$html$Html$Events$onClick(closeMsg)
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('×')
			]));
};
var $rundis$elm_bootstrap$Bootstrap$Modal$renderHeader = function (conf_) {
	var _v0 = conf_.b1;
	if (!_v0.$) {
		var cfg = _v0.a;
		return $elm$core$Maybe$Just(
			A2(
				$elm$html$Html$div,
				A2(
					$elm$core$List$cons,
					$elm$html$Html$Attributes$class('modal-header'),
					cfg.aQ),
				_Utils_ap(
					cfg.aS,
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Modal$closeButton(
							$rundis$elm_bootstrap$Bootstrap$Modal$getCloseMsg(conf_))
						]))));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$html$Html$Attributes$tabindex = function (n) {
	return A2(
		_VirtualDom_attribute,
		'tabIndex',
		$elm$core$String$fromInt(n));
};
var $rundis$elm_bootstrap$Bootstrap$Modal$view = F2(
	function (visibility, _v0) {
		var conf = _v0;
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_Utils_ap(
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_Utils_ap(
							_List_fromArray(
								[
									$elm$html$Html$Attributes$tabindex(-1)
								]),
							A2($rundis$elm_bootstrap$Bootstrap$Modal$display, visibility, conf)),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_Utils_ap(
									_List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'role', 'document'),
											$elm$html$Html$Attributes$class('elm-bootstrap-modal')
										]),
									_Utils_ap(
										$rundis$elm_bootstrap$Bootstrap$Modal$modalAttributes(conf.fr),
										conf.fr.a$ ? _List_fromArray(
											[
												A2(
												$elm$html$Html$Events$on,
												'click',
												$rundis$elm_bootstrap$Bootstrap$Modal$containerClickDecoder(conf.aT))
											]) : _List_Nil)),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-content')
											]),
										A2(
											$elm$core$List$filterMap,
											$elm$core$Basics$identity,
											_List_fromArray(
												[
													$rundis$elm_bootstrap$Bootstrap$Modal$renderHeader(conf),
													$rundis$elm_bootstrap$Bootstrap$Modal$renderBody(conf.K),
													$rundis$elm_bootstrap$Bootstrap$Modal$renderFooter(conf.c8)
												])))
									]))
							]))
					]),
				A2($rundis$elm_bootstrap$Bootstrap$Modal$backdrop, visibility, conf)));
	});
var $author$project$RCMediaList$mediaPickerView = F3(
	function (_v0, objectList, messages) {
		var model = _v0.a;
		var visibility = _v0.b;
		var uploadBtn = A2($elm$html$Html$map, $author$project$RCMediaList$MainMessage, messages.eW);
		var tableConfig = A2($author$project$RCMediaList$configMediaPicker, model.aF, messages);
		var tableList = A5($author$project$RCMediaList$view, uploadBtn, 0, model, tableConfig, objectList);
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Modal$view,
			visibility,
			A2(
				$rundis$elm_bootstrap$Bootstrap$Modal$attrs,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('rc-media-picker')
					]),
				A3(
					$rundis$elm_bootstrap$Bootstrap$Modal$footer,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$rundis$elm_bootstrap$Bootstrap$Button$button,
							_List_fromArray(
								[
									$rundis$elm_bootstrap$Bootstrap$Button$secondary,
									$rundis$elm_bootstrap$Bootstrap$Button$attrs(
									_List_fromArray(
										[
											$elm$html$Html$Events$onClick(
											$author$project$RCMediaList$MainMessage(messages.e5))
										]))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								]))
						]),
					A3(
						$rundis$elm_bootstrap$Bootstrap$Modal$body,
						_List_Nil,
						_List_fromArray(
							[tableList]),
						A3(
							$rundis$elm_bootstrap$Bootstrap$Modal$h1,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Insert media object')
								]),
							A2(
								$rundis$elm_bootstrap$Bootstrap$Modal$hideOnBackdropClick,
								true,
								$rundis$elm_bootstrap$Bootstrap$Modal$large(
									A2(
										$rundis$elm_bootstrap$Bootstrap$Modal$scrollableBody,
										true,
										$rundis$elm_bootstrap$Bootstrap$Modal$config(
											$author$project$RCMediaList$MainMessage(messages.e5))))))))));
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$Attrs = function (a) {
	return {$: 4, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Dropdown$Attrs(attrs_);
};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$DropdownItem = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$buttonItem = F2(
	function (attributes, children) {
		return A2(
			$elm$html$Html$button,
			_Utils_ap(
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$class('dropdown-item')
					]),
				attributes),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$dropDir = function (maybeDir) {
	var toAttrs = function (dir) {
		return _List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'drop' + function () {
					if (!dir) {
						return 'left';
					} else {
						return 'right';
					}
				}())
			]);
	};
	return A2(
		$elm$core$Maybe$withDefault,
		_List_Nil,
		A2($elm$core$Maybe$map, toAttrs, maybeDir));
};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$dropdownAttributes = F2(
	function (status, config) {
		return _Utils_ap(
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('btn-group', true),
							_Utils_Tuple2('show', status !== 2),
							_Utils_Tuple2('dropup', config.a3)
						]))
				]),
			_Utils_ap(
				$rundis$elm_bootstrap$Bootstrap$Dropdown$dropDir(config.aX),
				config.aQ));
	});
var $elm$core$String$fromFloat = _String_fromNumber;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$menuStyles = F2(
	function (_v0, config) {
		var status = _v0.eJ;
		var toggleSize = _v0.cP;
		var menuSize = _v0.a9;
		var px = function (n) {
			return $elm$core$String$fromFloat(n) + 'px';
		};
		var translate = F3(
			function (x, y, z) {
				return 'translate3d(' + (px(x) + (',' + (px(y) + (',' + (px(z) + ')')))));
			});
		var _default = _List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'top', '0'),
				A2($elm$html$Html$Attributes$style, 'left', '0')
			]);
		var _v1 = _Utils_Tuple2(config.a3, config.aX);
		_v1$0:
		while (true) {
			if (!_v1.b.$) {
				if (_v1.b.a === 1) {
					if (_v1.a) {
						break _v1$0;
					} else {
						var _v2 = _v1.b.a;
						return _default;
					}
				} else {
					if (_v1.a) {
						break _v1$0;
					} else {
						var _v3 = _v1.b.a;
						return _Utils_ap(
							_default,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$Attributes$style,
									'transform',
									A3(translate, (-toggleSize.e_) - menuSize.e_, 0, 0))
								]));
					}
				}
			} else {
				if (_v1.a) {
					break _v1$0;
				} else {
					return _Utils_ap(
						_default,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$Attributes$style,
								'transform',
								A3(translate, -toggleSize.e_, toggleSize.d0, 0))
							]));
				}
			}
		}
		return _Utils_ap(
			_default,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$Attributes$style,
					'transform',
					A3(translate, -toggleSize.e_, -menuSize.d0, 0))
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$dropdownMenu = F3(
	function (state, config, items) {
		var status = state.eJ;
		var menuSize = state.a9;
		var wrapperStyles = (status === 2) ? _List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'height', '0'),
				A2($elm$html$Html$Attributes$style, 'overflow', 'hidden'),
				A2($elm$html$Html$Attributes$style, 'position', 'relative')
			]) : _List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'position', 'relative')
			]);
		return A2(
			$elm$html$Html$div,
			wrapperStyles,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('dropdown-menu', true),
										_Utils_Tuple2('dropdown-menu-right', config.b0),
										_Utils_Tuple2('show', status !== 2)
									]))
							]),
						_Utils_ap(
							A2($rundis$elm_bootstrap$Bootstrap$Dropdown$menuStyles, state, config),
							config.b9)),
					A2(
						$elm$core$List$map,
						function (_v0) {
							var x = _v0;
							return x;
						},
						items))
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$applyModifier = F2(
	function (option, options) {
		switch (option.$) {
			case 1:
				return _Utils_update(
					options,
					{b0: true});
			case 0:
				return _Utils_update(
					options,
					{a3: true});
			case 4:
				var attrs_ = option.a;
				return _Utils_update(
					options,
					{aQ: attrs_});
			case 2:
				var dir = option.a;
				return _Utils_update(
					options,
					{
						aX: $elm$core$Maybe$Just(dir)
					});
			default:
				var attrs_ = option.a;
				return _Utils_update(
					options,
					{b9: attrs_});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$defaultOptions = {aQ: _List_Nil, aX: $elm$core$Maybe$Nothing, b0: false, a3: false, b9: _List_Nil};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$toConfig = function (options) {
	return A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Dropdown$applyModifier, $rundis$elm_bootstrap$Bootstrap$Dropdown$defaultOptions, options);
};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$dropdown = F2(
	function (state, _v0) {
		var status = state.eJ;
		var toggleMsg = _v0.fA;
		var toggleButton = _v0.fz;
		var items = _v0.fi;
		var options = _v0.fr;
		var config = $rundis$elm_bootstrap$Bootstrap$Dropdown$toConfig(options);
		var _v1 = toggleButton;
		var buttonFn = _v1;
		return A2(
			$elm$html$Html$div,
			A2($rundis$elm_bootstrap$Bootstrap$Dropdown$dropdownAttributes, status, config),
			_List_fromArray(
				[
					A2(buttonFn, toggleMsg, state),
					A3($rundis$elm_bootstrap$Bootstrap$Dropdown$dropdownMenu, state, config, items)
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Dark = 6;
var $rundis$elm_bootstrap$Bootstrap$Button$outlineDark = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(6));
var $rundis$elm_bootstrap$Bootstrap$Dropdown$DropdownToggle = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$Open = 0;
var $rundis$elm_bootstrap$Bootstrap$Dropdown$nextStatus = function (status) {
	switch (status) {
		case 0:
			return 2;
		case 1:
			return 2;
		default:
			return 0;
	}
};
var $elm$json$Json$Decode$float = _Json_decodeFloat;
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetHeight = A2($elm$json$Json$Decode$field, 'offsetHeight', $elm$json$Json$Decode$float);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetWidth = A2($elm$json$Json$Decode$field, 'offsetWidth', $elm$json$Json$Decode$float);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetLeft = A2($elm$json$Json$Decode$field, 'offsetLeft', $elm$json$Json$Decode$float);
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetParent = F2(
	function (x, decoder) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$field,
					'offsetParent',
					$elm$json$Json$Decode$null(x)),
					A2($elm$json$Json$Decode$field, 'offsetParent', decoder)
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetTop = A2($elm$json$Json$Decode$field, 'offsetTop', $elm$json$Json$Decode$float);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$scrollLeft = A2($elm$json$Json$Decode$field, 'scrollLeft', $elm$json$Json$Decode$float);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$scrollTop = A2($elm$json$Json$Decode$field, 'scrollTop', $elm$json$Json$Decode$float);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$position = F2(
	function (x, y) {
		return A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var x_ = _v0.a;
				var y_ = _v0.b;
				return A2(
					$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetParent,
					_Utils_Tuple2(x_, y_),
					A2($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$position, x_, y_));
			},
			A5(
				$elm$json$Json$Decode$map4,
				F4(
					function (scrollLeft_, scrollTop_, offsetLeft_, offsetTop_) {
						return _Utils_Tuple2((x + offsetLeft_) - scrollLeft_, (y + offsetTop_) - scrollTop_);
					}),
				$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$scrollLeft,
				$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$scrollTop,
				$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetLeft,
				$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetTop));
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$boundingArea = A4(
	$elm$json$Json$Decode$map3,
	F3(
		function (_v0, width, height) {
			var x = _v0.a;
			var y = _v0.b;
			return {d0: height, ac: x, aj: y, e_: width};
		}),
	A2($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$position, 0, 0),
	$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetWidth,
	$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$offsetHeight);
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$childNode = function (idx) {
	return $elm$json$Json$Decode$at(
		_List_fromArray(
			[
				'childNodes',
				$elm$core$String$fromInt(idx)
			]));
};
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$nextSibling = function (decoder) {
	return A2($elm$json$Json$Decode$field, 'nextSibling', decoder);
};
var $rundis$elm_bootstrap$Bootstrap$Dropdown$isToggle = A2(
	$elm$json$Json$Decode$andThen,
	function (_class) {
		return A2($elm$core$String$contains, 'dropdown-toggle', _class) ? $elm$json$Json$Decode$succeed(true) : $elm$json$Json$Decode$succeed(false);
	},
	$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$className);
var $rundis$elm_bootstrap$Bootstrap$Dropdown$toggler = F2(
	function (path, decoder) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$andThen,
					function (res) {
						return res ? A2($elm$json$Json$Decode$at, path, decoder) : $elm$json$Json$Decode$fail('');
					},
					A2($elm$json$Json$Decode$at, path, $rundis$elm_bootstrap$Bootstrap$Dropdown$isToggle)),
					A2(
					$elm$json$Json$Decode$andThen,
					function (_v0) {
						return A2(
							$rundis$elm_bootstrap$Bootstrap$Dropdown$toggler,
							_Utils_ap(
								path,
								_List_fromArray(
									['parentElement'])),
							decoder);
					},
					A2(
						$elm$json$Json$Decode$at,
						_Utils_ap(
							path,
							_List_fromArray(
								['parentElement'])),
						$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$className)),
					$elm$json$Json$Decode$fail('No toggler found')
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$sizeDecoder = A3(
	$elm$json$Json$Decode$map2,
	$elm$core$Tuple$pair,
	A2(
		$rundis$elm_bootstrap$Bootstrap$Dropdown$toggler,
		_List_fromArray(
			['target']),
		$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$boundingArea),
	A2(
		$rundis$elm_bootstrap$Bootstrap$Dropdown$toggler,
		_List_fromArray(
			['target']),
		$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$nextSibling(
			A2($rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$childNode, 0, $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$boundingArea))));
var $rundis$elm_bootstrap$Bootstrap$Dropdown$clickHandler = F2(
	function (toMsg, state) {
		var status = state.eJ;
		return A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var b = _v0.a;
				var m = _v0.b;
				return $elm$json$Json$Decode$succeed(
					toMsg(
						{
							a9: m,
							eJ: $rundis$elm_bootstrap$Bootstrap$Dropdown$nextStatus(status),
							cP: b
						}));
			},
			$rundis$elm_bootstrap$Bootstrap$Dropdown$sizeDecoder);
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$togglePrivate = F4(
	function (buttonOptions, children, toggleMsg, state) {
		return A2(
			$elm$html$Html$button,
			_Utils_ap(
				$rundis$elm_bootstrap$Bootstrap$Internal$Button$buttonAttributes(buttonOptions),
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('dropdown-toggle'),
						$elm$html$Html$Attributes$type_('button'),
						A2(
						$elm$html$Html$Events$on,
						'click',
						A2($rundis$elm_bootstrap$Bootstrap$Dropdown$clickHandler, toggleMsg, state))
					])),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Dropdown$toggle = F2(
	function (buttonOptions, children) {
		return A2($rundis$elm_bootstrap$Bootstrap$Dropdown$togglePrivate, buttonOptions, children);
	});
var $author$project$View$mkDropdown = F5(
	function (modelState, openMsg, mainTxt, itemMsgLst, titleText) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('d-inline-block')
				]),
			_List_fromArray(
				[
					A2(
					$rundis$elm_bootstrap$Bootstrap$Dropdown$dropdown,
					modelState,
					{
						fi: A2(
							$elm$core$List$map,
							function (_v0) {
								var buttonTxt = _v0.a;
								var clickMsg = _v0.b;
								return A2(
									$rundis$elm_bootstrap$Bootstrap$Dropdown$buttonItem,
									_List_fromArray(
										[
											$elm$html$Html$Events$onClick(clickMsg)
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(buttonTxt)
										]));
							},
							itemMsgLst),
						fr: _List_fromArray(
							[
								$rundis$elm_bootstrap$Bootstrap$Dropdown$attrs(
								A2(
									$elm$core$List$map,
									$elm$html$Html$Attributes$class,
									_List_fromArray(
										['m-0', 'mb-1', 'mt-1', 'mr-1'])))
							]),
						fz: A2(
							$rundis$elm_bootstrap$Bootstrap$Dropdown$toggle,
							_List_fromArray(
								[
									$rundis$elm_bootstrap$Bootstrap$Button$outlineDark,
									$rundis$elm_bootstrap$Bootstrap$Button$attrs(
									_List_fromArray(
										[
											$elm$html$Html$Attributes$title(titleText)
										]))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(mainTxt)
								])),
						fA: openMsg
					})
				]));
	});
var $author$project$Settings$Bold = 0;
var $author$project$View$BoldIcon = 5;
var $author$project$Settings$Bullet = 6;
var $author$project$Settings$H1 = 2;
var $author$project$Settings$H2 = 3;
var $author$project$Settings$H3 = 4;
var $author$project$Main$InsertAtCursor = function (a) {
	return {$: 34, a: a};
};
var $author$project$Main$InsertFootnoteAtCursor = {$: 35};
var $author$project$Settings$Italic = 1;
var $author$project$View$ItalicIcon = 3;
var $author$project$Settings$Link = 9;
var $author$project$View$LinkIcon = 4;
var $author$project$View$ListIcon = 8;
var $author$project$View$MediaIcon = 18;
var $author$project$Settings$Numbered = 7;
var $author$project$View$NumberedIcon = 9;
var $author$project$Main$OpenMediaPicker = {$: 37};
var $author$project$Settings$Quote = 8;
var $author$project$View$QuoteIcon = 6;
var $author$project$Main$RedoCM = {$: 43};
var $author$project$View$RedoIcon = 15;
var $author$project$Main$UndoCM = {$: 42};
var $author$project$View$UndoIcon = 14;
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Light = 7;
var $rundis$elm_bootstrap$Bootstrap$Button$light = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Roled(7));
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$m0 = $elm$html$Html$Attributes$class('m-0');
var $author$project$View$mkButton = function (props) {
	var spacing = props.ej ? _List_fromArray(
		[$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$m0]) : _List_Nil;
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Button$button,
		_List_fromArray(
			[
				props.ep ? $rundis$elm_bootstrap$Bootstrap$Button$outlineDark : $rundis$elm_bootstrap$Bootstrap$Button$light,
				$rundis$elm_bootstrap$Bootstrap$Button$attrs(
				A2(
					$elm$core$List$append,
					_List_fromArray(
						[
							$elm$html$Html$Events$onClick(props.w),
							A2(
							$elm$html$Html$Attributes$style,
							'display',
							props.d1 ? 'none' : 'inline-block'),
							$elm$html$Html$Attributes$title(props.dC)
						]),
					A2($elm$core$List$append, spacing, props.dj)))
			]),
		_List_fromArray(
			[
				$author$project$View$renderIcon(props.i),
				$elm$html$Html$text(props.aI)
			]));
};
var $author$project$Main$separator = A2(
	$elm$html$Html$span,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('separator')
		]),
	_List_fromArray(
		[
			$elm$html$Html$text('|')
		]));
var $author$project$Settings$snippet = function (s) {
	switch (s) {
		case 0:
			return _Utils_Tuple2('****', -2);
		case 1:
			return _Utils_Tuple2('__', -1);
		case 2:
			return _Utils_Tuple2('# ', 0);
		case 3:
			return _Utils_Tuple2('## ', 0);
		case 4:
			return _Utils_Tuple2('### ', 0);
		case 5:
			return _Utils_Tuple2('#### ', 0);
		case 6:
			return _Utils_Tuple2('* ', 0);
		case 7:
			return _Utils_Tuple2('1. ', 0);
		case 8:
			return _Utils_Tuple2('> ', 0);
		default:
			return _Utils_Tuple2('[](http://)', -10);
	}
};
var $author$project$Main$mkEditorToolbar = function (tabState) {
	var snippetMsg = function (action) {
		return $author$project$Main$InsertAtCursor(
			$author$project$Settings$snippet(action));
	};
	var _default = $author$project$View$defaultButton(
		$author$project$Main$InsertAtCursor(
			_Utils_Tuple2('', 0)));
	var cmEditor = function () {
		switch (tabState) {
			case 0:
				return true;
			case 1:
				return false;
			case 2:
				return true;
			default:
				return false;
		}
	}();
	return _Utils_ap(
		_List_fromArray(
			[
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						w: snippetMsg(2),
						aI: 'H1',
						dC: 'Header 1'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						w: snippetMsg(3),
						aI: 'H2',
						dC: 'Header 2'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						w: snippetMsg(4),
						aI: 'H3',
						dC: 'Header 3'
					})),
				$author$project$Main$separator,
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 5,
						w: snippetMsg(0),
						dC: 'Bold'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 3,
						w: snippetMsg(1),
						dC: 'Italic'
					})),
				$author$project$Main$separator,
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 8,
						w: snippetMsg(6),
						dC: 'Unordered list'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 9,
						w: snippetMsg(7),
						dC: 'Numbered list'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 4,
						w: snippetMsg(9),
						dC: 'Hyperlink'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{
						i: 6,
						w: snippetMsg(8),
						dC: 'Quote'
					})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{w: $author$project$Main$InsertFootnoteAtCursor, aI: '*', dC: 'Insert footnote'})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{i: 18, w: $author$project$Main$OpenMediaPicker, dC: 'Insert media object'})),
				$author$project$Main$separator
			]),
		cmEditor ? _List_fromArray(
			[
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{d1: !cmEditor, i: 14, w: $author$project$Main$UndoCM, dC: 'Undo'})),
				$author$project$View$mkButton(
				_Utils_update(
					_default,
					{d1: !cmEditor, i: 15, w: $author$project$Main$RedoCM, dC: 'Redo'})),
				$author$project$Main$separator
			]) : _List_Nil);
};
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mr1 = $elm$html$Html$Attributes$class('mr-1');
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mt1 = $elm$html$Html$Attributes$class('mt-1');
var $author$project$View$optionalBlock = F2(
	function (show, elem) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$Attributes$style,
					'display',
					show ? 'inline-block' : 'none')
				]),
			_List_fromArray(
				[elem]));
	});
var $author$project$Main$selectedEditorIsMarkdown = function (model) {
	var _v0 = model.p;
	if (!_v0.a) {
		var _v1 = _v0.a;
		return true;
	} else {
		return false;
	}
};
var $author$project$View$SaveIcon = 2;
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$Util$wordCount = function (str) {
	var splitter = F2(
		function (_char, z) {
			return A2(
				$elm$core$List$concatMap,
				$elm$core$String$split(
					$elm$core$String$fromChar(_char)),
				z);
		});
	var splitChars = $elm$core$String$toList(' .,!?()');
	var splitted = A3(
		$elm$core$List$foldr,
		splitter,
		_List_fromArray(
			[str]),
		splitChars);
	var filterEmpty = A2(
		$elm$core$List$filter,
		A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
		splitted);
	return $elm$core$List$length(filterEmpty);
};
var $author$project$Exposition$wordCount = function (expo) {
	return $author$project$Util$wordCount(expo.a7);
};
var $author$project$Main$statusBar = F2(
	function (showStatus, model) {
		var wc = $author$project$Exposition$wordCount(model.b);
		var statusDisplayStyle = showStatus ? 'inline-block' : 'none';
		var status = 'Word count: ' + $elm$core$String$fromInt(wc);
		var saveButtonText = model.R ? 'Saved' : 'Not Saved';
		var saveButton = A2(
			$rundis$elm_bootstrap$Bootstrap$Button$button,
			_List_fromArray(
				[
					$rundis$elm_bootstrap$Bootstrap$Button$light,
					$rundis$elm_bootstrap$Bootstrap$Button$attrs(
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('save-button'),
							$elm$html$Html$Events$onClick($author$project$Main$SaveExposition)
						]))
				]),
			_List_fromArray(
				[
					$author$project$View$renderIcon(2),
					$elm$html$Html$text(saveButtonText)
				]));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('editor-status-bar')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							A2($elm$html$Html$Attributes$style, 'display', statusDisplayStyle)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(status)
						])),
					saveButton
				]));
	});
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $rundis$elm_bootstrap$Bootstrap$Modal$h2 = $rundis$elm_bootstrap$Bootstrap$Modal$titledHeader($elm$html$Html$h2);
var $rundis$elm_bootstrap$Bootstrap$Internal$Button$Primary = 0;
var $rundis$elm_bootstrap$Bootstrap$Button$outlinePrimary = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(0));
var $rundis$elm_bootstrap$Bootstrap$Button$outlineSecondary = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Outlined(1));
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$RCMediaEdit$Copyright = 3;
var $author$project$RCMediaEdit$Description = 1;
var $author$project$RCMediaEdit$LicenseField = 4;
var $author$project$RCMediaEdit$Name = 0;
var $author$project$RCMediaPreview$PreviewBig = 0;
var $author$project$RCMediaEdit$UserClass = 2;
var $author$project$Licenses$allLicenses = A2(
	$elm$core$List$map,
	function (_v0) {
		var license = _v0.a;
		return license;
	},
	$author$project$Licenses$licensesDict);
var $author$project$RCMediaEdit$CssClass = F2(
	function (selector, name) {
		return {l: name, dr: selector};
	});
var $author$project$RCMediaEdit$cssClasses = _List_fromArray(
	[
		A2($author$project$RCMediaEdit$CssClass, 'big', 'big'),
		A2($author$project$RCMediaEdit$CssClass, 'medium', 'medium'),
		A2($author$project$RCMediaEdit$CssClass, 'small', 'small'),
		A2($author$project$RCMediaEdit$CssClass, 'floatLeftSmall', 'small & float left'),
		A2($author$project$RCMediaEdit$CssClass, 'floatRightSmall', 'small & float right'),
		A2($author$project$RCMediaEdit$CssClass, 'floatRightMedium', 'medium & float right'),
		A2($author$project$RCMediaEdit$CssClass, 'floatLeftMedium', 'medium & float left')
	]);
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$form = _VirtualDom_node('form');
var $rundis$elm_bootstrap$Bootstrap$Form$form = F2(
	function (attributes, children) {
		return A2($elm$html$Html$form, attributes, children);
	});
var $rundis$elm_bootstrap$Bootstrap$Form$applyModifier = F2(
	function (modifier, options) {
		var value = modifier;
		return _Utils_update(
			options,
			{
				aQ: _Utils_ap(options.aQ, value)
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Form$defaultOptions = {aQ: _List_Nil};
var $rundis$elm_bootstrap$Bootstrap$Form$toAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Form$applyModifier, $rundis$elm_bootstrap$Bootstrap$Form$defaultOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('form-group')
			]),
		options.aQ);
};
var $rundis$elm_bootstrap$Bootstrap$Form$group = F2(
	function (options, children) {
		return A2(
			$elm$html$Html$div,
			$rundis$elm_bootstrap$Bootstrap$Form$toAttributes(options),
			children);
	});
var $elm$html$Html$label = _VirtualDom_node('label');
var $rundis$elm_bootstrap$Bootstrap$Form$label = F2(
	function (attributes, children) {
		return A2(
			$elm$html$Html$label,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('form-control-label'),
				attributes),
			children);
	});
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Column = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Grid$col = F2(
	function (options, children) {
		return $rundis$elm_bootstrap$Bootstrap$Grid$Column(
			{aS: children, fr: options});
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$Col = 0;
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$Width = F2(
	function (screenSize, columnCount) {
		return {dO: columnCount, eE: screenSize};
	});
var $rundis$elm_bootstrap$Bootstrap$General$Internal$XS = 0;
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColAlign = F2(
	function (align_, options) {
		var _v0 = align_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						bA: $elm$core$Maybe$Just(align_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						by: $elm$core$Maybe$Just(align_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						bx: $elm$core$Maybe$Just(align_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						bw: $elm$core$Maybe$Just(align_)
					});
			default:
				return _Utils_update(
					options,
					{
						bz: $elm$core$Maybe$Just(align_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOffset = F2(
	function (offset_, options) {
		var _v0 = offset_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						ch: $elm$core$Maybe$Just(offset_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						ce: $elm$core$Maybe$Just(offset_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						cd: $elm$core$Maybe$Just(offset_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						cc: $elm$core$Maybe$Just(offset_)
					});
			default:
				return _Utils_update(
					options,
					{
						cg: $elm$core$Maybe$Just(offset_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOrder = F2(
	function (order_, options) {
		var _v0 = order_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						cq: $elm$core$Maybe$Just(order_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						co: $elm$core$Maybe$Just(order_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						cn: $elm$core$Maybe$Just(order_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						cm: $elm$core$Maybe$Just(order_)
					});
			default:
				return _Utils_update(
					options,
					{
						cp: $elm$core$Maybe$Just(order_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColPull = F2(
	function (pull_, options) {
		var _v0 = pull_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						cw: $elm$core$Maybe$Just(pull_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						cu: $elm$core$Maybe$Just(pull_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						ct: $elm$core$Maybe$Just(pull_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						cs: $elm$core$Maybe$Just(pull_)
					});
			default:
				return _Utils_update(
					options,
					{
						cv: $elm$core$Maybe$Just(pull_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColPush = F2(
	function (push_, options) {
		var _v0 = push_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						cB: $elm$core$Maybe$Just(push_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						cz: $elm$core$Maybe$Just(push_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						cy: $elm$core$Maybe$Just(push_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						cx: $elm$core$Maybe$Just(push_)
					});
			default:
				return _Utils_update(
					options,
					{
						cA: $elm$core$Maybe$Just(push_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColWidth = F2(
	function (width_, options) {
		var _v0 = width_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						br: $elm$core$Maybe$Just(width_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						bp: $elm$core$Maybe$Just(width_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						bo: $elm$core$Maybe$Just(width_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						bn: $elm$core$Maybe$Just(width_)
					});
			default:
				return _Utils_update(
					options,
					{
						bq: $elm$core$Maybe$Just(width_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOption = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 6:
				var attrs = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs)
					});
			case 0:
				var width_ = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColWidth, width_, options);
			case 1:
				var offset_ = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOffset, offset_, options);
			case 2:
				var pull_ = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColPull, pull_, options);
			case 3:
				var push_ = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColPush, push_, options);
			case 4:
				var order_ = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOrder, order_, options);
			case 5:
				var align = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColAlign, align, options);
			default:
				var align = modifier.a;
				return _Utils_update(
					options,
					{
						cO: $elm$core$Maybe$Just(align)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$columnCountOption = function (size) {
	switch (size) {
		case 0:
			return $elm$core$Maybe$Nothing;
		case 1:
			return $elm$core$Maybe$Just('1');
		case 2:
			return $elm$core$Maybe$Just('2');
		case 3:
			return $elm$core$Maybe$Just('3');
		case 4:
			return $elm$core$Maybe$Just('4');
		case 5:
			return $elm$core$Maybe$Just('5');
		case 6:
			return $elm$core$Maybe$Just('6');
		case 7:
			return $elm$core$Maybe$Just('7');
		case 8:
			return $elm$core$Maybe$Just('8');
		case 9:
			return $elm$core$Maybe$Just('9');
		case 10:
			return $elm$core$Maybe$Just('10');
		case 11:
			return $elm$core$Maybe$Just('11');
		case 12:
			return $elm$core$Maybe$Just('12');
		default:
			return $elm$core$Maybe$Just('auto');
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$colWidthClass = function (_v0) {
	var screenSize = _v0.eE;
	var columnCount = _v0.dO;
	return $elm$html$Html$Attributes$class(
		'col' + (A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$map,
				function (v) {
					return '-' + v;
				},
				$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(screenSize))) + A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$map,
				function (v) {
					return '-' + v;
				},
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$columnCountOption(columnCount)))));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$colWidthsToAttributes = function (widths) {
	var width_ = function (w) {
		return A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$colWidthClass, w);
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, width_, widths));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$defaultColOptions = {bw: $elm$core$Maybe$Nothing, bx: $elm$core$Maybe$Nothing, by: $elm$core$Maybe$Nothing, bz: $elm$core$Maybe$Nothing, bA: $elm$core$Maybe$Nothing, aQ: _List_Nil, cc: $elm$core$Maybe$Nothing, cd: $elm$core$Maybe$Nothing, ce: $elm$core$Maybe$Nothing, cg: $elm$core$Maybe$Nothing, ch: $elm$core$Maybe$Nothing, cm: $elm$core$Maybe$Nothing, cn: $elm$core$Maybe$Nothing, co: $elm$core$Maybe$Nothing, cp: $elm$core$Maybe$Nothing, cq: $elm$core$Maybe$Nothing, cs: $elm$core$Maybe$Nothing, ct: $elm$core$Maybe$Nothing, cu: $elm$core$Maybe$Nothing, cv: $elm$core$Maybe$Nothing, cw: $elm$core$Maybe$Nothing, cx: $elm$core$Maybe$Nothing, cy: $elm$core$Maybe$Nothing, cz: $elm$core$Maybe$Nothing, cA: $elm$core$Maybe$Nothing, cB: $elm$core$Maybe$Nothing, cO: $elm$core$Maybe$Nothing, bn: $elm$core$Maybe$Nothing, bo: $elm$core$Maybe$Nothing, bp: $elm$core$Maybe$Nothing, bq: $elm$core$Maybe$Nothing, br: $elm$core$Maybe$Nothing};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetCountOption = function (size) {
	switch (size) {
		case 0:
			return '0';
		case 1:
			return '1';
		case 2:
			return '2';
		case 3:
			return '3';
		case 4:
			return '4';
		case 5:
			return '5';
		case 6:
			return '6';
		case 7:
			return '7';
		case 8:
			return '8';
		case 9:
			return '9';
		case 10:
			return '10';
		default:
			return '11';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$screenSizeToPartialString = function (screenSize) {
	var _v0 = $rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(screenSize);
	if (!_v0.$) {
		var s = _v0.a;
		return '-' + (s + '-');
	} else {
		return '-';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetClass = function (_v0) {
	var screenSize = _v0.eE;
	var offsetCount = _v0.ek;
	return $elm$html$Html$Attributes$class(
		'offset' + ($rundis$elm_bootstrap$Bootstrap$Grid$Internal$screenSizeToPartialString(screenSize) + $rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetCountOption(offsetCount)));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetsToAttributes = function (offsets) {
	var offset_ = function (m) {
		return A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetClass, m);
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, offset_, offsets));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$orderColOption = function (size) {
	switch (size) {
		case 0:
			return 'first';
		case 1:
			return '1';
		case 2:
			return '2';
		case 3:
			return '3';
		case 4:
			return '4';
		case 5:
			return '5';
		case 6:
			return '6';
		case 7:
			return '7';
		case 8:
			return '8';
		case 9:
			return '9';
		case 10:
			return '10';
		case 11:
			return '11';
		case 12:
			return '12';
		default:
			return 'last';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$orderToAttributes = function (orders) {
	var order_ = function (m) {
		if (!m.$) {
			var screenSize = m.a.eE;
			var moveCount = m.a.aC;
			return $elm$core$Maybe$Just(
				$elm$html$Html$Attributes$class(
					'order' + ($rundis$elm_bootstrap$Bootstrap$Grid$Internal$screenSizeToPartialString(screenSize) + $rundis$elm_bootstrap$Bootstrap$Grid$Internal$orderColOption(moveCount))));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, order_, orders));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$moveCountOption = function (size) {
	switch (size) {
		case 0:
			return '0';
		case 1:
			return '1';
		case 2:
			return '2';
		case 3:
			return '3';
		case 4:
			return '4';
		case 5:
			return '5';
		case 6:
			return '6';
		case 7:
			return '7';
		case 8:
			return '8';
		case 9:
			return '9';
		case 10:
			return '10';
		case 11:
			return '11';
		default:
			return '12';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$pullsToAttributes = function (pulls) {
	var pull_ = function (m) {
		if (!m.$) {
			var screenSize = m.a.eE;
			var moveCount = m.a.aC;
			return $elm$core$Maybe$Just(
				$elm$html$Html$Attributes$class(
					'pull' + ($rundis$elm_bootstrap$Bootstrap$Grid$Internal$screenSizeToPartialString(screenSize) + $rundis$elm_bootstrap$Bootstrap$Grid$Internal$moveCountOption(moveCount))));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, pull_, pulls));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$pushesToAttributes = function (pushes) {
	var push_ = function (m) {
		if (!m.$) {
			var screenSize = m.a.eE;
			var moveCount = m.a.aC;
			return $elm$core$Maybe$Just(
				$elm$html$Html$Attributes$class(
					'push' + ($rundis$elm_bootstrap$Bootstrap$Grid$Internal$screenSizeToPartialString(screenSize) + $rundis$elm_bootstrap$Bootstrap$Grid$Internal$moveCountOption(moveCount))));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, push_, pushes));
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Text$textAlignDirOption = function (dir) {
	switch (dir) {
		case 1:
			return 'center';
		case 0:
			return 'left';
		default:
			return 'right';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Internal$Text$textAlignClass = function (_v0) {
	var dir = _v0.dU;
	var size = _v0.eG;
	return $elm$html$Html$Attributes$class(
		'text' + (A2(
			$elm$core$Maybe$withDefault,
			'-',
			A2(
				$elm$core$Maybe$map,
				function (s) {
					return '-' + (s + '-');
				},
				$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(size))) + $rundis$elm_bootstrap$Bootstrap$Internal$Text$textAlignDirOption(dir)));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$verticalAlignOption = function (align) {
	switch (align) {
		case 0:
			return 'start';
		case 1:
			return 'center';
		default:
			return 'end';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$vAlignClass = F2(
	function (prefix, _v0) {
		var align = _v0.dH;
		var screenSize = _v0.eE;
		return $elm$html$Html$Attributes$class(
			_Utils_ap(
				prefix,
				_Utils_ap(
					A2(
						$elm$core$Maybe$withDefault,
						'',
						A2(
							$elm$core$Maybe$map,
							function (v) {
								return v + '-';
							},
							$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(screenSize))),
					$rundis$elm_bootstrap$Bootstrap$Grid$Internal$verticalAlignOption(align))));
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$vAlignsToAttributes = F2(
	function (prefix, aligns) {
		var align = function (a) {
			return A2(
				$elm$core$Maybe$map,
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$vAlignClass(prefix),
				a);
		};
		return A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			A2($elm$core$List$map, align, aligns));
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$colAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyColOption, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$defaultColOptions, modifiers);
	var shouldAddDefaultXs = !$elm$core$List$length(
		A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[options.br, options.bp, options.bo, options.bn, options.bq])));
	return _Utils_ap(
		$rundis$elm_bootstrap$Bootstrap$Grid$Internal$colWidthsToAttributes(
			_List_fromArray(
				[
					shouldAddDefaultXs ? $elm$core$Maybe$Just(
					A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$Width, 0, 0)) : options.br,
					options.bp,
					options.bo,
					options.bn,
					options.bq
				])),
		_Utils_ap(
			$rundis$elm_bootstrap$Bootstrap$Grid$Internal$offsetsToAttributes(
				_List_fromArray(
					[options.ch, options.ce, options.cd, options.cc, options.cg])),
			_Utils_ap(
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$pullsToAttributes(
					_List_fromArray(
						[options.cw, options.cu, options.ct, options.cs, options.cv])),
				_Utils_ap(
					$rundis$elm_bootstrap$Bootstrap$Grid$Internal$pushesToAttributes(
						_List_fromArray(
							[options.cB, options.cz, options.cy, options.cx, options.cA])),
					_Utils_ap(
						$rundis$elm_bootstrap$Bootstrap$Grid$Internal$orderToAttributes(
							_List_fromArray(
								[options.cq, options.co, options.cn, options.cm, options.cp])),
						_Utils_ap(
							A2(
								$rundis$elm_bootstrap$Bootstrap$Grid$Internal$vAlignsToAttributes,
								'align-self-',
								_List_fromArray(
									[options.bA, options.by, options.bx, options.bw, options.bz])),
							_Utils_ap(
								function () {
									var _v0 = options.cO;
									if (!_v0.$) {
										var a = _v0.a;
										return _List_fromArray(
											[
												$rundis$elm_bootstrap$Bootstrap$Internal$Text$textAlignClass(a)
											]);
									} else {
										return _List_Nil;
									}
								}(),
								options.aQ)))))));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$renderCol = function (column) {
	switch (column.$) {
		case 0:
			var options = column.a.fr;
			var children = column.a.aS;
			return A2(
				$elm$html$Html$div,
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$colAttributes(options),
				children);
		case 1:
			var e = column.a;
			return e;
		default:
			var options = column.a.fr;
			var children = column.a.aS;
			return A3(
				$elm$html$Html$Keyed$node,
				'div',
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$colAttributes(options),
				children);
	}
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowHAlign = F2(
	function (align, options) {
		var _v0 = align.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						b$: $elm$core$Maybe$Just(align)
					});
			case 1:
				return _Utils_update(
					options,
					{
						bZ: $elm$core$Maybe$Just(align)
					});
			case 2:
				return _Utils_update(
					options,
					{
						bY: $elm$core$Maybe$Just(align)
					});
			case 3:
				return _Utils_update(
					options,
					{
						bX: $elm$core$Maybe$Just(align)
					});
			default:
				return _Utils_update(
					options,
					{
						b_: $elm$core$Maybe$Just(align)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowVAlign = F2(
	function (align_, options) {
		var _v0 = align_.eE;
		switch (_v0) {
			case 0:
				return _Utils_update(
					options,
					{
						cX: $elm$core$Maybe$Just(align_)
					});
			case 1:
				return _Utils_update(
					options,
					{
						cV: $elm$core$Maybe$Just(align_)
					});
			case 2:
				return _Utils_update(
					options,
					{
						cU: $elm$core$Maybe$Just(align_)
					});
			case 3:
				return _Utils_update(
					options,
					{
						cT: $elm$core$Maybe$Just(align_)
					});
			default:
				return _Utils_update(
					options,
					{
						cW: $elm$core$Maybe$Just(align_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowOption = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 2:
				var attrs = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs)
					});
			case 0:
				var align = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowVAlign, align, options);
			default:
				var align = modifier.a;
				return A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowHAlign, align, options);
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$defaultRowOptions = {aQ: _List_Nil, bX: $elm$core$Maybe$Nothing, bY: $elm$core$Maybe$Nothing, bZ: $elm$core$Maybe$Nothing, b_: $elm$core$Maybe$Nothing, b$: $elm$core$Maybe$Nothing, cT: $elm$core$Maybe$Nothing, cU: $elm$core$Maybe$Nothing, cV: $elm$core$Maybe$Nothing, cW: $elm$core$Maybe$Nothing, cX: $elm$core$Maybe$Nothing};
var $rundis$elm_bootstrap$Bootstrap$General$Internal$horizontalAlignOption = function (align) {
	switch (align) {
		case 0:
			return 'start';
		case 1:
			return 'center';
		case 2:
			return 'end';
		case 3:
			return 'around';
		default:
			return 'between';
	}
};
var $rundis$elm_bootstrap$Bootstrap$General$Internal$hAlignClass = function (_v0) {
	var align = _v0.dH;
	var screenSize = _v0.eE;
	return $elm$html$Html$Attributes$class(
		'justify-content-' + (A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$map,
				function (v) {
					return v + '-';
				},
				$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(screenSize))) + $rundis$elm_bootstrap$Bootstrap$General$Internal$horizontalAlignOption(align)));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$hAlignsToAttributes = function (aligns) {
	var align = function (a) {
		return A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$General$Internal$hAlignClass, a);
	};
	return A2(
		$elm$core$List$filterMap,
		$elm$core$Basics$identity,
		A2($elm$core$List$map, align, aligns));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$rowAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$applyRowOption, $rundis$elm_bootstrap$Bootstrap$Grid$Internal$defaultRowOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('row')
			]),
		_Utils_ap(
			A2(
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$vAlignsToAttributes,
				'align-items-',
				_List_fromArray(
					[options.cX, options.cV, options.cU, options.cT, options.cW])),
			_Utils_ap(
				$rundis$elm_bootstrap$Bootstrap$Grid$Internal$hAlignsToAttributes(
					_List_fromArray(
						[options.b$, options.bZ, options.bY, options.bX, options.b_])),
				options.aQ)));
};
var $rundis$elm_bootstrap$Bootstrap$Grid$row = F2(
	function (options, cols) {
		return A2(
			$elm$html$Html$div,
			$rundis$elm_bootstrap$Bootstrap$Grid$Internal$rowAttributes(options),
			A2($elm$core$List$map, $rundis$elm_bootstrap$Bootstrap$Grid$renderCol, cols));
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$Col6 = 6;
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$ColWidth = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Grid$Internal$width = F2(
	function (size, count) {
		return $rundis$elm_bootstrap$Bootstrap$Grid$Internal$ColWidth(
			A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$Width, size, count));
	});
var $rundis$elm_bootstrap$Bootstrap$Grid$Col$sm6 = A2($rundis$elm_bootstrap$Bootstrap$Grid$Internal$width, 1, 6);
var $author$project$RCMediaEdit$twoCols = F2(
	function (col1, col2) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Grid$row,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$rundis$elm_bootstrap$Bootstrap$Grid$col,
					_List_fromArray(
						[$rundis$elm_bootstrap$Bootstrap$Grid$Col$sm6]),
					col1),
					A2(
					$rundis$elm_bootstrap$Bootstrap$Grid$col,
					_List_fromArray(
						[$rundis$elm_bootstrap$Bootstrap$Grid$Col$sm6]),
					col2)
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Select$Attrs = function (a) {
	return {$: 6, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Select$Attrs(attrs_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$Id = function (a) {
	return {$: 1, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$id = function (id_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Select$Id(id_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$Item = $elm$core$Basics$identity;
var $elm$html$Html$option = _VirtualDom_node('option');
var $rundis$elm_bootstrap$Bootstrap$Form$Select$item = F2(
	function (attributes, children) {
		return A2($elm$html$Html$option, attributes, children);
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Select$Select = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Form$Select$create = F2(
	function (options, items) {
		return {fi: items, fr: options};
	});
var $elm$html$Html$select = _VirtualDom_node('select');
var $rundis$elm_bootstrap$Bootstrap$Form$Select$applyModifier = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 0:
				var size_ = modifier.a;
				return _Utils_update(
					options,
					{
						eG: $elm$core$Maybe$Just(size_)
					});
			case 1:
				var id_ = modifier.a;
				return _Utils_update(
					options,
					{
						j: $elm$core$Maybe$Just(id_)
					});
			case 2:
				return _Utils_update(
					options,
					{A: true});
			case 3:
				var val = modifier.a;
				return _Utils_update(
					options,
					{bT: val});
			case 4:
				var onChange_ = modifier.a;
				return _Utils_update(
					options,
					{
						ci: $elm$core$Maybe$Just(onChange_)
					});
			case 5:
				var validation_ = modifier.a;
				return _Utils_update(
					options,
					{
						eX: $elm$core$Maybe$Just(validation_)
					});
			default:
				var attrs_ = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Select$customEventOnChange = function (tagger) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$defaultOptions = {aQ: _List_Nil, A: false, bT: false, j: $elm$core$Maybe$Nothing, ci: $elm$core$Maybe$Nothing, eG: $elm$core$Maybe$Nothing, eX: $elm$core$Maybe$Nothing};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$sizeAttribute = F2(
	function (isCustom, size_) {
		var prefix = isCustom ? 'custom-select-' : 'form-control-';
		return A2(
			$elm$core$Maybe$map,
			function (s) {
				return $elm$html$Html$Attributes$class(
					_Utils_ap(prefix, s));
			},
			$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(size_));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$FormInternal$validationToString = function (validation) {
	if (!validation) {
		return 'is-valid';
	} else {
		return 'is-invalid';
	}
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$validationAttribute = function (validation_) {
	return $elm$html$Html$Attributes$class(
		$rundis$elm_bootstrap$Bootstrap$Form$FormInternal$validationToString(validation_));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$toAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Form$Select$applyModifier, $rundis$elm_bootstrap$Bootstrap$Form$Select$defaultOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('form-control', !options.A),
						_Utils_Tuple2('custom-select', options.A)
					])),
				$elm$html$Html$Attributes$disabled(options.bT)
			]),
		_Utils_ap(
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$id, options.j),
						A2(
						$elm$core$Maybe$andThen,
						$rundis$elm_bootstrap$Bootstrap$Form$Select$sizeAttribute(options.A),
						options.eG),
						A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Form$Select$customEventOnChange, options.ci),
						A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Form$Select$validationAttribute, options.eX)
					])),
			options.aQ));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$view = function (_v0) {
	var options = _v0.fr;
	var items = _v0.fi;
	return A2(
		$elm$html$Html$select,
		$rundis$elm_bootstrap$Bootstrap$Form$Select$toAttributes(options),
		A2(
			$elm$core$List$map,
			function (_v1) {
				var e = _v1;
				return e;
			},
			items));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Select$select = F2(
	function (options, items) {
		return $rundis$elm_bootstrap$Bootstrap$Form$Select$view(
			A2($rundis$elm_bootstrap$Bootstrap$Form$Select$create, options, items));
	});
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$RCMediaEdit$viewClassesPicker = F4(
	function (id, classList, currentSelection, editMessage) {
		var selectItem = function (item) {
			var isSelected = _Utils_eq(currentSelection, item.dr);
			return A2(
				$rundis$elm_bootstrap$Bootstrap$Form$Select$item,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$value(item.dr),
						$elm$html$Html$Attributes$selected(isSelected)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(item.l)
					]));
		};
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Form$Select$select,
			_List_fromArray(
				[
					$rundis$elm_bootstrap$Bootstrap$Form$Select$id(id),
					$rundis$elm_bootstrap$Bootstrap$Form$Select$attrs(
					_List_fromArray(
						[
							$elm$html$Html$Events$onInput(editMessage)
						]))
				]),
			A2($elm$core$List$map, selectItem, classList));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Attrs = function (a) {
	return {$: 10, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Input$Attrs(attrs_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$FormInternal$Danger = 1;
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Validation = function (a) {
	return {$: 6, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$danger = $rundis$elm_bootstrap$Bootstrap$Form$Input$Validation(1);
var $elm$html$Html$small = _VirtualDom_node('small');
var $rundis$elm_bootstrap$Bootstrap$Form$help = F2(
	function (attributes, children) {
		return A2(
			$elm$html$Html$small,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('form-text text-muted'),
				attributes),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Form$invalidFeedback = F2(
	function (attributes, children) {
		return A2(
			$elm$html$Html$div,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('invalid-feedback'),
				attributes),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Size = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$small = $rundis$elm_bootstrap$Bootstrap$Form$Input$Size(1);
var $rundis$elm_bootstrap$Bootstrap$Form$FormInternal$Success = 0;
var $rundis$elm_bootstrap$Bootstrap$Form$Input$success = $rundis$elm_bootstrap$Bootstrap$Form$Input$Validation(0);
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Text = 0;
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Input = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Form$Input$Type = function (a) {
	return {$: 2, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$create = F2(
	function (tipe, options) {
		return {
			fr: A2(
				$elm$core$List$cons,
				$rundis$elm_bootstrap$Bootstrap$Form$Input$Type(tipe),
				options)
		};
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Input$applyModifier = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 0:
				var size_ = modifier.a;
				return _Utils_update(
					options,
					{
						eG: $elm$core$Maybe$Just(size_)
					});
			case 1:
				var id_ = modifier.a;
				return _Utils_update(
					options,
					{
						j: $elm$core$Maybe$Just(id_)
					});
			case 2:
				var tipe = modifier.a;
				return _Utils_update(
					options,
					{bi: tipe});
			case 3:
				var val = modifier.a;
				return _Utils_update(
					options,
					{bT: val});
			case 4:
				var value_ = modifier.a;
				return _Utils_update(
					options,
					{
						aM: $elm$core$Maybe$Just(value_)
					});
			case 7:
				var value_ = modifier.a;
				return _Utils_update(
					options,
					{
						be: $elm$core$Maybe$Just(value_)
					});
			case 5:
				var onInput_ = modifier.a;
				return _Utils_update(
					options,
					{
						aD: $elm$core$Maybe$Just(onInput_)
					});
			case 6:
				var validation_ = modifier.a;
				return _Utils_update(
					options,
					{
						eX: $elm$core$Maybe$Just(validation_)
					});
			case 8:
				var val = modifier.a;
				return _Utils_update(
					options,
					{cD: val});
			case 9:
				var val = modifier.a;
				return _Utils_update(
					options,
					{bf: val});
			default:
				var attrs_ = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Input$defaultOptions = {aQ: _List_Nil, bT: false, j: $elm$core$Maybe$Nothing, aD: $elm$core$Maybe$Nothing, be: $elm$core$Maybe$Nothing, bf: false, cD: false, eG: $elm$core$Maybe$Nothing, bi: 0, eX: $elm$core$Maybe$Nothing, aM: $elm$core$Maybe$Nothing};
var $elm$html$Html$Attributes$readonly = $elm$html$Html$Attributes$boolProperty('readOnly');
var $rundis$elm_bootstrap$Bootstrap$Form$Input$sizeAttribute = function (size) {
	return A2(
		$elm$core$Maybe$map,
		function (s) {
			return $elm$html$Html$Attributes$class('form-control-' + s);
		},
		$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(size));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$typeAttribute = function (inputType) {
	return $elm$html$Html$Attributes$type_(
		function () {
			switch (inputType) {
				case 0:
					return 'text';
				case 1:
					return 'password';
				case 2:
					return 'datetime-local';
				case 3:
					return 'date';
				case 4:
					return 'month';
				case 5:
					return 'time';
				case 6:
					return 'week';
				case 7:
					return 'number';
				case 8:
					return 'email';
				case 9:
					return 'url';
				case 10:
					return 'search';
				case 11:
					return 'tel';
				default:
					return 'color';
			}
		}());
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$validationAttribute = function (validation) {
	return $elm$html$Html$Attributes$class(
		$rundis$elm_bootstrap$Bootstrap$Form$FormInternal$validationToString(validation));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$toAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Form$Input$applyModifier, $rundis$elm_bootstrap$Bootstrap$Form$Input$defaultOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				options.bf ? 'form-control-plaintext' : 'form-control'),
				$elm$html$Html$Attributes$disabled(options.bT),
				$elm$html$Html$Attributes$readonly(options.cD || options.bf),
				$rundis$elm_bootstrap$Bootstrap$Form$Input$typeAttribute(options.bi)
			]),
		_Utils_ap(
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$id, options.j),
						A2($elm$core$Maybe$andThen, $rundis$elm_bootstrap$Bootstrap$Form$Input$sizeAttribute, options.eG),
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$value, options.aM),
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$placeholder, options.be),
						A2($elm$core$Maybe$map, $elm$html$Html$Events$onInput, options.aD),
						A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Form$Input$validationAttribute, options.eX)
					])),
			options.aQ));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$view = function (_v0) {
	var options = _v0.fr;
	return A2(
		$elm$html$Html$input,
		$rundis$elm_bootstrap$Bootstrap$Form$Input$toAttributes(options),
		_List_Nil);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Input$input = F2(
	function (tipe, options) {
		return $rundis$elm_bootstrap$Bootstrap$Form$Input$view(
			A2($rundis$elm_bootstrap$Bootstrap$Form$Input$create, tipe, options));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Input$text = $rundis$elm_bootstrap$Bootstrap$Form$Input$input(0);
var $author$project$RCMediaEdit$viewInputWithLabel = function (props) {
	var _v0 = function () {
		var _v1 = props.eX;
		if (!_v1.$) {
			return _Utils_Tuple2($rundis$elm_bootstrap$Bootstrap$Form$Input$success, _List_Nil);
		} else {
			var s = _v1.a;
			return _Utils_Tuple2(
				$rundis$elm_bootstrap$Bootstrap$Form$Input$danger,
				_List_fromArray(
					[
						$elm$html$Html$text(s)
					]));
		}
	}();
	var inputResult = _v0.a;
	var validationFeedback = _v0.b;
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Form$group,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$rundis$elm_bootstrap$Bootstrap$Form$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$for(props.ag)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(props.ay)
					])),
				$rundis$elm_bootstrap$Bootstrap$Form$Input$text(
				_List_fromArray(
					[
						$rundis$elm_bootstrap$Bootstrap$Form$Input$small,
						inputResult,
						$rundis$elm_bootstrap$Bootstrap$Form$Input$attrs(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$placeholder(props.be),
								$elm$html$Html$Attributes$value(props.aM),
								$elm$html$Html$Events$onInput(props.aD)
							]))
					])),
				A2($rundis$elm_bootstrap$Bootstrap$Form$invalidFeedback, _List_Nil, validationFeedback),
				A2(
				$rundis$elm_bootstrap$Bootstrap$Form$help,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(props.a_)
					]))
			]));
};
var $author$project$Licenses$getDescription = function (license) {
	switch (license) {
		case 0:
			return 'All rights reserved';
		case 1:
			return 'CC BY';
		case 2:
			return 'CC BY SA';
		case 3:
			return 'CC BY NC';
		case 4:
			return 'CC BY NC SA';
		case 5:
			return 'CC BY NC ND';
		default:
			return 'Public Domain';
	}
};
var $author$project$RCMediaEdit$viewLicensePicker = F4(
	function (id, licenseOptions, currentSelection, editMessage) {
		var selectItem = function (license) {
			var isSelected = _Utils_eq(currentSelection, license);
			return A2(
				$rundis$elm_bootstrap$Bootstrap$Form$Select$item,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$value(
						$author$project$Licenses$asString(license)),
						$elm$html$Html$Attributes$selected(isSelected)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$author$project$Licenses$getDescription(license))
					]));
		};
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Form$Select$select,
			_List_fromArray(
				[
					$rundis$elm_bootstrap$Bootstrap$Form$Select$id(id),
					$rundis$elm_bootstrap$Bootstrap$Form$Select$attrs(
					_List_fromArray(
						[
							$elm$html$Html$Events$onInput(editMessage)
						]))
				]),
			A2($elm$core$List$map, selectItem, $author$project$Licenses$allLicenses));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Attrs = function (a) {
	return {$: 6, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Attrs(attrs_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Id = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$id = function (id_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Id(id_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Rows = function (a) {
	return {$: 1, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$rows = function (rows_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Rows(rows_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$Textarea = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$create = function (options) {
	return {fr: options};
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$applyModifier = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 0:
				var id_ = modifier.a;
				return _Utils_update(
					options,
					{
						j: $elm$core$Maybe$Just(id_)
					});
			case 1:
				var rows_ = modifier.a;
				return _Utils_update(
					options,
					{
						cH: $elm$core$Maybe$Just(rows_)
					});
			case 2:
				return _Utils_update(
					options,
					{bT: true});
			case 3:
				var value_ = modifier.a;
				return _Utils_update(
					options,
					{
						aM: $elm$core$Maybe$Just(value_)
					});
			case 4:
				var onInput_ = modifier.a;
				return _Utils_update(
					options,
					{
						aD: $elm$core$Maybe$Just(onInput_)
					});
			case 5:
				var validation = modifier.a;
				return _Utils_update(
					options,
					{
						eX: $elm$core$Maybe$Just(validation)
					});
			default:
				var attrs_ = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$defaultOptions = {aQ: _List_Nil, bT: false, j: $elm$core$Maybe$Nothing, aD: $elm$core$Maybe$Nothing, cH: $elm$core$Maybe$Nothing, eX: $elm$core$Maybe$Nothing, aM: $elm$core$Maybe$Nothing};
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$validationAttribute = function (validation) {
	return $elm$html$Html$Attributes$class(
		$rundis$elm_bootstrap$Bootstrap$Form$FormInternal$validationToString(validation));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$toAttributes = function (modifiers) {
	var options = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Form$Textarea$applyModifier, $rundis$elm_bootstrap$Bootstrap$Form$Textarea$defaultOptions, modifiers);
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('form-control'),
				$elm$html$Html$Attributes$disabled(options.bT)
			]),
		_Utils_ap(
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$id, options.j),
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$rows, options.cH),
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$value, options.aM),
						A2($elm$core$Maybe$map, $elm$html$Html$Events$onInput, options.aD),
						A2($elm$core$Maybe$map, $rundis$elm_bootstrap$Bootstrap$Form$Textarea$validationAttribute, options.eX)
					])),
			options.aQ));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$view = function (_v0) {
	var options = _v0.fr;
	return A2(
		$elm$html$Html$textarea,
		$rundis$elm_bootstrap$Bootstrap$Form$Textarea$toAttributes(options),
		_List_Nil);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Textarea$textarea = A2($elm$core$Basics$composeL, $rundis$elm_bootstrap$Bootstrap$Form$Textarea$view, $rundis$elm_bootstrap$Bootstrap$Form$Textarea$create);
var $author$project$RCMediaEdit$viewTextAreaWithLabel = function (props) {
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Form$group,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$label,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$for(props.ag)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(props.ay)
					])),
				$rundis$elm_bootstrap$Bootstrap$Form$Textarea$textarea(
				_List_fromArray(
					[
						$rundis$elm_bootstrap$Bootstrap$Form$Textarea$id(props.ag),
						$rundis$elm_bootstrap$Bootstrap$Form$Textarea$rows(7),
						$rundis$elm_bootstrap$Bootstrap$Form$Textarea$attrs(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$value(props.aM),
								$elm$html$Html$Events$onInput(props.aD)
							]))
					]))
			]));
};
var $author$project$RCMediaEdit$viewBody = F3(
	function (objectState, editTool, objectInEdit) {
		var thumbnailUrl = $author$project$Exposition$thumbUrl(objectInEdit);
		var nameProps = {
			a_: '',
			ay: 'name',
			ag: 'name',
			aD: editTool(0),
			be: '',
			eX: objectState.eX.l,
			aM: objectInEdit.l
		};
		var descriptionProps = {
			a_: '',
			ay: 'description',
			ag: 'description',
			aD: editTool(1),
			be: 'optional',
			eX: objectState.eX.aW,
			aM: objectInEdit.aW
		};
		var currentLicense = function () {
			var _v1 = objectState.eX.b5;
			if (!_v1.$) {
				var val = _v1.a;
				return $author$project$Licenses$fromString(val);
			} else {
				var val = _v1.a;
				return 0;
			}
		}();
		var currentClass = function () {
			var _v0 = objectState.eX.W;
			if (!_v0.$) {
				var val = _v0.a;
				return val;
			} else {
				return 'big';
			}
		}();
		var copyrightProps = {
			a_: '',
			ay: 'copyright',
			ag: 'copyright',
			aD: editTool(3),
			be: '',
			eX: objectState.eX.aU,
			aM: objectInEdit.aU
		};
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('edit-media-dialog')
				]),
			_List_fromArray(
				[
					A2(
					$rundis$elm_bootstrap$Bootstrap$Form$form,
					_List_Nil,
					$elm$core$List$singleton(
						A2(
							$author$project$RCMediaEdit$twoCols,
							_List_fromArray(
								[
									$author$project$RCMediaEdit$viewInputWithLabel(nameProps),
									A2(
									$rundis$elm_bootstrap$Bootstrap$Form$group,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											$rundis$elm_bootstrap$Bootstrap$Form$label,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$for('classPicker')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('display size and location')
												])),
											A4(
											$author$project$RCMediaEdit$viewClassesPicker,
											'classPicker',
											$author$project$RCMediaEdit$cssClasses,
											currentClass,
											editTool(2))
										])),
									$author$project$RCMediaEdit$viewTextAreaWithLabel(descriptionProps)
								]),
							_List_fromArray(
								[
									$author$project$RCMediaEdit$viewInputWithLabel(copyrightProps),
									A2(
									$rundis$elm_bootstrap$Bootstrap$Form$group,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											$rundis$elm_bootstrap$Bootstrap$Form$label,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$for('licensePicker')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('license type')
												])),
											A4(
											$author$project$RCMediaEdit$viewLicensePicker,
											'licensePicker',
											$author$project$Licenses$allLicenses,
											currentLicense,
											editTool(4))
										])),
									A2($author$project$RCMediaPreview$viewThumbnail, objectInEdit, 0)
								]))))
				]));
	});
var $author$project$RCMediaEdit$view = F5(
	function (makeMediaEditFun, closeMediaDialogMsg, insertMediaMsg, exposition, model) {
		var emptyDiv = A2($elm$html$Html$div, _List_Nil, _List_Nil);
		var _v0 = model;
		var visibility = _v0.cZ;
		var object = _v0.eg;
		var objectViewState = _v0.eh;
		var allowInsert = _v0.bB;
		if (!object.$) {
			var obj = object.a;
			if (!objectViewState.$) {
				var objViewState = objectViewState.a;
				var mediaEditView = A3(
					$author$project$RCMediaEdit$viewBody,
					objViewState,
					makeMediaEditFun(obj),
					obj);
				var insertButton = A2(
					$rundis$elm_bootstrap$Bootstrap$Button$button,
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Button$outlinePrimary,
							$rundis$elm_bootstrap$Bootstrap$Button$attrs(
							_List_fromArray(
								[
									$elm$html$Html$Events$onClick(
									insertMediaMsg(obj))
								]))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Insert')
						]));
				var closeButton = A2(
					$rundis$elm_bootstrap$Bootstrap$Button$button,
					_List_fromArray(
						[
							$rundis$elm_bootstrap$Bootstrap$Button$outlineSecondary,
							$rundis$elm_bootstrap$Bootstrap$Button$attrs(
							_List_fromArray(
								[
									$elm$html$Html$Events$onClick(closeMediaDialogMsg)
								]))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Done')
						]));
				var buttons = allowInsert ? _List_fromArray(
					[insertButton, closeButton]) : _List_fromArray(
					[closeButton]);
				return A2(
					$rundis$elm_bootstrap$Bootstrap$Modal$view,
					visibility,
					A3(
						$rundis$elm_bootstrap$Bootstrap$Modal$footer,
						_List_Nil,
						buttons,
						A3(
							$rundis$elm_bootstrap$Bootstrap$Modal$body,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$p,
									_List_Nil,
									_List_fromArray(
										[mediaEditView]))
								]),
							A2(
								$rundis$elm_bootstrap$Bootstrap$Modal$hideOnBackdropClick,
								true,
								$rundis$elm_bootstrap$Bootstrap$Modal$large(
									A3(
										$rundis$elm_bootstrap$Bootstrap$Modal$h2,
										_List_Nil,
										_List_fromArray(
											[
												$elm$html$Html$text('Edit ' + obj.l)
											]),
										A2(
											$rundis$elm_bootstrap$Bootstrap$Modal$scrollableBody,
											true,
											$rundis$elm_bootstrap$Bootstrap$Modal$config(closeMediaDialogMsg))))))));
			} else {
				return emptyDiv;
			}
		} else {
			return emptyDiv;
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Button$danger = $rundis$elm_bootstrap$Bootstrap$Internal$Button$Coloring(
	$rundis$elm_bootstrap$Bootstrap$Internal$Button$Roled(5));
var $rundis$elm_bootstrap$Bootstrap$Modal$small = function (_v0) {
	var conf = _v0;
	var options = conf.fr;
	return _Utils_update(
		conf,
		{
			fr: _Utils_update(
				options,
				{
					ba: $elm$core$Maybe$Just(1)
				})
		});
};
var $author$project$UserConfirm$view = function (_v0) {
	var visibility = _v0.cZ;
	var content = _v0.c2;
	var actions = _v0.e0;
	var _v1 = _Utils_Tuple3(visibility, content, actions);
	if ((!_v1.b.$) && (!_v1.c.$)) {
		var vis = _v1.a;
		var content_ = _v1.b.a;
		var actions_ = _v1.c.a;
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Modal$view,
			vis,
			A3(
				$rundis$elm_bootstrap$Bootstrap$Modal$footer,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$rundis$elm_bootstrap$Bootstrap$Button$button,
						_List_fromArray(
							[
								$rundis$elm_bootstrap$Bootstrap$Button$danger,
								$rundis$elm_bootstrap$Bootstrap$Button$attrs(
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick(actions_.dQ)
									]))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(content_.dQ)
							])),
						A2(
						$rundis$elm_bootstrap$Bootstrap$Button$button,
						_List_fromArray(
							[
								$rundis$elm_bootstrap$Bootstrap$Button$secondary,
								$rundis$elm_bootstrap$Bootstrap$Button$attrs(
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick(actions_.eu)
									]))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(content_.eu)
							]))
					]),
				A3(
					$rundis$elm_bootstrap$Bootstrap$Modal$body,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(content_.fs)
								]))
						]),
					A2(
						$rundis$elm_bootstrap$Bootstrap$Modal$hideOnBackdropClick,
						true,
						$rundis$elm_bootstrap$Bootstrap$Modal$small(
							$rundis$elm_bootstrap$Bootstrap$Modal$config(actions_.eu))))));
	} else {
		return A2($elm$html$Html$div, _List_Nil, _List_Nil);
	}
};
var $author$project$Main$AlertMsg = function (a) {
	return {$: 29, a: a};
};
var $author$project$Main$DismissAllProblems = {$: 30};
var $author$project$Problems$httpErrorString = function (err) {
	switch (err.$) {
		case 0:
			var url = err.a;
			return 'Bad url: ' + url;
		case 1:
			return 'Timeout';
		case 2:
			return 'A network error';
		case 3:
			var status = err.a;
			return 'Bad status: ' + $elm$core$String$fromInt(status);
		default:
			var body = err.a;
			return 'Bad body:' + body;
	}
};
var $author$project$Problems$asString = function (problem) {
	switch (problem.$) {
		case 0:
			return 'Unknown exposition url';
		case 1:
			var e = problem.a;
			return 'cannot load media ' + $author$project$Problems$httpErrorString(e);
		case 2:
			var name = problem.a;
			return 'Media object \"' + (name + '\" cannot be found');
		case 12:
			var e = problem.a;
			return 'Cannot load, http error: ' + $author$project$Problems$httpErrorString(e);
		case 3:
			return 'Saving error, please check your connection.';
		case 4:
			var e = problem.a;
			return 'Problem updating media :' + $author$project$Problems$httpErrorString(e);
		case 5:
			return 'Unkown media field in the json';
		case 6:
			var e = problem.a;
			return 'Import http error: ' + $author$project$Problems$httpErrorString(e);
		case 7:
			var s = problem.a;
			return 'Unkown upload file type: ' + s;
		case 8:
			var e = problem.a;
			return 'Media upload failed with an http error, because of ' + $author$project$Problems$httpErrorString(e);
		case 9:
			var e = problem.a;
			return 'Problem with footnotes: ' + e;
		case 10:
			return 'Exposition export failed ';
		case 11:
			var e = problem.a;
			return 'Json decode problem ';
		case 13:
			var s = problem.a;
			return s;
		case 14:
			var s = problem.a;
			return 'Cannot number footnotes ' + s;
		case 15:
			return 'User classes couldn\'t be retrieved';
		default:
			var s = problem.a;
			return 'Message error: ' + s;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Alert$dismissable = F2(
	function (dismissMsg, _v0) {
		var configRec = _v0;
		return _Utils_update(
			configRec,
			{
				Z: $elm$core$Maybe$Just(dismissMsg)
			});
	});
var $elm$html$Html$h4 = _VirtualDom_node('h4');
var $rundis$elm_bootstrap$Bootstrap$Alert$headingPrivate = F3(
	function (elemFn, attributes, children_) {
		return A2(
			elemFn,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('alert-header'),
				attributes),
			children_);
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$h4 = F2(
	function (attributes, children_) {
		return A3($rundis$elm_bootstrap$Bootstrap$Alert$headingPrivate, $elm$html$Html$h4, attributes, children_);
	});
var $rundis$elm_bootstrap$Bootstrap$Alert$info = function (conf) {
	return A2($rundis$elm_bootstrap$Bootstrap$Alert$role, 3, conf);
};
var $rundis$elm_bootstrap$Bootstrap$Alert$link = F2(
	function (attributes, children_) {
		return A2(
			$elm$html$Html$a,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('alert-link'),
				attributes),
			children_);
	});
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm_community$list_extra$List$Extra$uniqueHelp = F4(
	function (f, existing, remaining, accumulator) {
		uniqueHelp:
		while (true) {
			if (!remaining.b) {
				return $elm$core$List$reverse(accumulator);
			} else {
				var first = remaining.a;
				var rest = remaining.b;
				var computedFirst = f(first);
				if (A2($elm$core$Set$member, computedFirst, existing)) {
					var $temp$f = f,
						$temp$existing = existing,
						$temp$remaining = rest,
						$temp$accumulator = accumulator;
					f = $temp$f;
					existing = $temp$existing;
					remaining = $temp$remaining;
					accumulator = $temp$accumulator;
					continue uniqueHelp;
				} else {
					var $temp$f = f,
						$temp$existing = A2($elm$core$Set$insert, computedFirst, existing),
						$temp$remaining = rest,
						$temp$accumulator = A2($elm$core$List$cons, first, accumulator);
					f = $temp$f;
					existing = $temp$existing;
					remaining = $temp$remaining;
					accumulator = $temp$accumulator;
					continue uniqueHelp;
				}
			}
		}
	});
var $elm_community$list_extra$List$Extra$uniqueBy = F2(
	function (f, list) {
		return A4($elm_community$list_extra$List$Extra$uniqueHelp, f, $elm$core$Set$empty, list, _List_Nil);
	});
var $author$project$Main$viewAlert = function (model) {
	var isRealProblem = function (problem) {
		if (problem.$ === 2) {
			return false;
		} else {
			return true;
		}
	};
	var realProblems = A2($elm$core$List$filter, isRealProblem, model.H);
	var uniqueProblems = A2($elm_community$list_extra$List$Extra$uniqueBy, $author$project$Problems$asString, realProblems);
	if (!uniqueProblems.b) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'display', 'none')
				]),
			_List_Nil);
	} else {
		var problems = uniqueProblems;
		var problemString = A2(
			$elm$core$String$join,
			' ',
			A2($elm$core$List$map, $author$project$Problems$asString, problems));
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Alert$view,
			model.am,
			A2(
				$rundis$elm_bootstrap$Bootstrap$Alert$children,
				_List_fromArray(
					[
						A2(
						$rundis$elm_bootstrap$Bootstrap$Alert$h4,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('There is a problem:')
							])),
						A2(
						$elm$html$Html$p,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(problemString)
							])),
						A2(
						$elm$html$Html$p,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Need help? '),
								A2(
								$rundis$elm_bootstrap$Bootstrap$Alert$link,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$href('mailto:support@researchcatalogue.net?body=' + ('Error message: ' + problemString))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('contact support')
									]))
							])),
						A2(
						$elm$html$Html$p,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$rundis$elm_bootstrap$Bootstrap$Button$button,
								_List_fromArray(
									[
										$rundis$elm_bootstrap$Bootstrap$Button$outlineSecondary,
										$rundis$elm_bootstrap$Bootstrap$Button$attrs(
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Main$DismissAllProblems)
											]))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Clear problems')
									]))
							]))
					]),
				A2(
					$rundis$elm_bootstrap$Bootstrap$Alert$dismissable,
					$author$project$Main$AlertMsg,
					$rundis$elm_bootstrap$Bootstrap$Alert$info($rundis$elm_bootstrap$Bootstrap$Alert$config))));
	}
};
var $author$project$Main$SwitchMarkdownEditor = function (a) {
	return {$: 31, a: a};
};
var $author$project$Main$TextareaMarkdown = 1;
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Attrs = function (a) {
	return {$: 7, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$attrs = function (attrs_) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Attrs(attrs_);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Checkbox = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$create = F2(
	function (options, label_) {
		return {ec: label_, fr: options};
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Label = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$label = F2(
	function (attributes, children) {
		return {aQ: attributes, aS: children};
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$applyModifier = F2(
	function (modifier, options) {
		switch (modifier.$) {
			case 0:
				var val = modifier.a;
				return _Utils_update(
					options,
					{
						j: $elm$core$Maybe$Just(val)
					});
			case 1:
				var val = modifier.a;
				return _Utils_update(
					options,
					{cM: val});
			case 2:
				return _Utils_update(
					options,
					{a2: true});
			case 3:
				var toMsg = modifier.a;
				return _Utils_update(
					options,
					{
						cj: $elm$core$Maybe$Just(toMsg)
					});
			case 4:
				return _Utils_update(
					options,
					{A: true});
			case 5:
				var val = modifier.a;
				return _Utils_update(
					options,
					{bT: val});
			case 6:
				var validation = modifier.a;
				return _Utils_update(
					options,
					{
						eX: $elm$core$Maybe$Just(validation)
					});
			default:
				var attrs_ = modifier.a;
				return _Utils_update(
					options,
					{
						aQ: _Utils_ap(options.aQ, attrs_)
					});
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Off = 1;
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$defaultOptions = {aQ: _List_Nil, A: false, bT: false, j: $elm$core$Maybe$Nothing, a2: false, cj: $elm$core$Maybe$Nothing, cM: 1, eX: $elm$core$Maybe$Nothing};
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$html$Html$Events$targetChecked = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'checked']),
	$elm$json$Json$Decode$bool);
var $elm$html$Html$Events$onCheck = function (tagger) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetChecked));
};
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$stateAttribute = function (state) {
	switch (state) {
		case 0:
			return $elm$html$Html$Attributes$checked(true);
		case 1:
			return $elm$html$Html$Attributes$checked(false);
		default:
			return A2($elm$html$Html$Attributes$attribute, 'indeterminate', 'true');
	}
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$toAttributes = function (options) {
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('form-check-input', !options.A),
						_Utils_Tuple2('custom-control-input', options.A)
					])),
				$elm$html$Html$Attributes$type_('checkbox'),
				$elm$html$Html$Attributes$disabled(options.bT),
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$stateAttribute(options.cM)
			]),
		_Utils_ap(
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				_List_fromArray(
					[
						A2($elm$core$Maybe$map, $elm$html$Html$Events$onCheck, options.cj),
						A2($elm$core$Maybe$map, $elm$html$Html$Attributes$id, options.j)
					])),
			_Utils_ap(
				function () {
					var _v0 = options.eX;
					if (!_v0.$) {
						var v = _v0.a;
						return _List_fromArray(
							[
								$elm$html$Html$Attributes$class(
								$rundis$elm_bootstrap$Bootstrap$Form$FormInternal$validationToString(v))
							]);
					} else {
						return _List_Nil;
					}
				}(),
				options.aQ)));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$view = function (_v0) {
	var chk = _v0;
	var opts = A3($elm$core$List$foldl, $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$applyModifier, $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$defaultOptions, chk.fr);
	var _v1 = chk.ec;
	var label_ = _v1;
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('form-check', !opts.A),
						_Utils_Tuple2('form-check-inline', (!opts.A) && opts.a2),
						_Utils_Tuple2('custom-control', opts.A),
						_Utils_Tuple2('custom-checkbox', opts.A),
						_Utils_Tuple2('custom-control-inline', opts.a2 && opts.A)
					]))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$input,
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$toAttributes(opts),
				_List_Nil),
				A2(
				$elm$html$Html$label,
				_Utils_ap(
					label_.aQ,
					_Utils_ap(
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('form-check-label', !opts.A),
										_Utils_Tuple2('custom-control-label', opts.A)
									]))
							]),
						function () {
							var _v2 = opts.j;
							if (!_v2.$) {
								var v = _v2.a;
								return _List_fromArray(
									[
										$elm$html$Html$Attributes$for(v)
									]);
							} else {
								return _List_Nil;
							}
						}())),
				label_.aS)
			]));
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$checkbox = F2(
	function (options, labelText) {
		return $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$view(
			A2(
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$create,
				options,
				A2(
					$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$label,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(labelText)
						]))));
	});
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$On = 0;
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Value = function (a) {
	return {$: 1, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$checked = function (isCheck) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$Value(
		isCheck ? 0 : 1);
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$OnChecked = function (a) {
	return {$: 3, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$onCheck = function (toMsg) {
	return $rundis$elm_bootstrap$Bootstrap$Form$Checkbox$OnChecked(toMsg);
};
var $author$project$Main$viewEditorCheckbox = function (markdownEditor) {
	var onToggle = function (becomesChecked) {
		return becomesChecked ? $author$project$Main$SwitchMarkdownEditor(1) : $author$project$Main$SwitchMarkdownEditor(0);
	};
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$checkbox,
		_List_fromArray(
			[
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$onCheck(onToggle),
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$checked(markdownEditor === 1),
				$rundis$elm_bootstrap$Bootstrap$Form$Checkbox$attrs(
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('editor-checkbox')
					]))
			]),
		'txt');
};
var $author$project$View$FullScreenIcon = 16;
var $author$project$View$NormalScreenIcon = 17;
var $author$project$Main$ToggleFullscreen = function (a) {
	return {$: 45, a: a};
};
var $author$project$Main$viewFullscreenSwitch = function (currentMode) {
	var tit = currentMode ? 'Exit Fullscreen' : 'Enter Fullscreen';
	var message = $author$project$Main$ToggleFullscreen(!currentMode);
	var icn = (!currentMode) ? 16 : 17;
	var btn = $author$project$View$defaultButton(message);
	var attrs = currentMode ? _List_fromArray(
		[
			$elm$html$Html$Attributes$class('enabled'),
			$elm$html$Html$Attributes$class('ml-1')
		]) : _List_Nil;
	return $author$project$View$mkButton(
		_Utils_update(
			btn,
			{i: icn, dj: attrs, dC: tit}));
};
var $author$project$Main$EditorMedia = 2;
var $author$project$Main$EditorStyle = 1;
var $author$project$Main$SwitchTab = function (a) {
	return {$: 26, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$Config = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Navbar$updateOptions = F2(
	function (mapper, _v0) {
		var conf = _v0;
		return _Utils_update(
			conf,
			{
				fr: mapper(conf.fr)
			});
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$attrs = F2(
	function (attrs_, conf) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$updateOptions,
			function (opt) {
				return _Utils_update(
					opt,
					{
						aQ: _Utils_ap(opt.aQ, attrs_)
					});
			},
			conf);
	});
var $rundis$elm_bootstrap$Bootstrap$General$Internal$MD = 2;
var $rundis$elm_bootstrap$Bootstrap$Navbar$toggleAt = F2(
	function (size, conf) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$updateOptions,
			function (opt) {
				return _Utils_update(
					opt,
					{bj: size});
			},
			conf);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$collapseMedium = $rundis$elm_bootstrap$Bootstrap$Navbar$toggleAt(2);
var $rundis$elm_bootstrap$Bootstrap$Internal$Role$Light = 6;
var $rundis$elm_bootstrap$Bootstrap$Navbar$Light = 1;
var $rundis$elm_bootstrap$Bootstrap$Navbar$Roled = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$config = function (toMsg) {
	return {
		aR: $elm$core$Maybe$Nothing,
		bQ: _List_Nil,
		fi: _List_Nil,
		fr: {
			aQ: _List_Nil,
			at: $elm$core$Maybe$Nothing,
			b2: false,
			cI: $elm$core$Maybe$Just(
				{
					bG: $rundis$elm_bootstrap$Bootstrap$Navbar$Roled(6),
					cb: 1
				}),
			bj: 0
		},
		eR: toMsg,
		al: false
	};
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$updateConfig = F2(
	function (mapper, _v0) {
		var conf = _v0;
		return mapper(conf);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$customItems = F2(
	function (items_, config_) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$updateConfig,
			function (conf) {
				return _Utils_update(
					conf,
					{bQ: items_});
			},
			config_);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$Item = function (a) {
	return {$: 0, a: a};
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$itemLink = F2(
	function (attributes, children) {
		return $rundis$elm_bootstrap$Bootstrap$Navbar$Item(
			{aQ: attributes, aS: children});
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$items = F2(
	function (items_, config_) {
		return A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$updateConfig,
			function (conf) {
				return _Utils_update(
					conf,
					{fi: items_});
			},
			config_);
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml0 = $elm$html$Html$Attributes$class('ml-0');
var $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml3 = $elm$html$Html$Attributes$class('ml-3');
var $rundis$elm_bootstrap$Bootstrap$Navbar$maybeBrand = function (brand_) {
	if (!brand_.$) {
		var b = brand_.a;
		return _List_fromArray(
			[b]);
	} else {
		return _List_Nil;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$sizeToComparable = function (size) {
	switch (size) {
		case 0:
			return 1;
		case 1:
			return 2;
		case 2:
			return 3;
		case 3:
			return 4;
		default:
			return 5;
	}
};
var $rundis$elm_bootstrap$Bootstrap$General$Internal$XL = 4;
var $rundis$elm_bootstrap$Bootstrap$Navbar$toScreenSize = function (windowWidth) {
	return (windowWidth <= 576) ? 0 : ((windowWidth <= 768) ? 1 : ((windowWidth <= 992) ? 2 : ((windowWidth <= 1200) ? 3 : 4)));
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$shouldHideMenu = F2(
	function (_v0, _v1) {
		var windowWidth = _v0.bs;
		var options = _v1.fr;
		var winMedia = function () {
			if (!windowWidth.$) {
				var s = windowWidth.a;
				return $rundis$elm_bootstrap$Bootstrap$Navbar$toScreenSize(s);
			} else {
				return 0;
			}
		}();
		return _Utils_cmp(
			$rundis$elm_bootstrap$Bootstrap$Navbar$sizeToComparable(winMedia),
			$rundis$elm_bootstrap$Bootstrap$Navbar$sizeToComparable(options.bj)) > 0;
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$Shown = 5;
var $rundis$elm_bootstrap$Bootstrap$Navbar$StartDown = 1;
var $rundis$elm_bootstrap$Bootstrap$Navbar$StartUp = 3;
var $rundis$elm_bootstrap$Bootstrap$Navbar$visibilityTransition = F2(
	function (withAnimation_, visibility) {
		var _v0 = _Utils_Tuple2(withAnimation_, visibility);
		if (_v0.a) {
			switch (_v0.b) {
				case 0:
					var _v1 = _v0.b;
					return 1;
				case 1:
					var _v2 = _v0.b;
					return 2;
				case 2:
					var _v3 = _v0.b;
					return 5;
				case 5:
					var _v4 = _v0.b;
					return 3;
				case 3:
					var _v5 = _v0.b;
					return 4;
				default:
					var _v6 = _v0.b;
					return 0;
			}
		} else {
			switch (_v0.b) {
				case 0:
					var _v7 = _v0.b;
					return 5;
				case 5:
					var _v8 = _v0.b;
					return 0;
				default:
					return 0;
			}
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$transitionHandler = F2(
	function (state, configRec) {
		return $elm$json$Json$Decode$succeed(
			configRec.eR(
				A2(
					$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
					function (s) {
						return _Utils_update(
							s,
							{
								cZ: A2($rundis$elm_bootstrap$Bootstrap$Navbar$visibilityTransition, configRec.al, s.cZ)
							});
					},
					state)));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$transitionStyle = function (maybeHeight) {
	var pixelHeight = A2(
		$elm$core$Maybe$withDefault,
		'0',
		A2(
			$elm$core$Maybe$map,
			function (v) {
				return $elm$core$String$fromFloat(v) + 'px';
			},
			maybeHeight));
	return _List_fromArray(
		[
			A2($elm$html$Html$Attributes$style, 'position', 'relative'),
			A2($elm$html$Html$Attributes$style, 'height', pixelHeight),
			A2($elm$html$Html$Attributes$style, 'width', '100%'),
			A2($elm$html$Html$Attributes$style, 'overflow', 'hidden'),
			A2($elm$html$Html$Attributes$style, '-webkit-transition-timing-function', 'ease'),
			A2($elm$html$Html$Attributes$style, '-o-transition-timing-function', 'ease'),
			A2($elm$html$Html$Attributes$style, 'transition-timing-function', 'ease'),
			A2($elm$html$Html$Attributes$style, '-webkit-transition-duration', '0.35s'),
			A2($elm$html$Html$Attributes$style, '-o-transition-duration', '0.35s'),
			A2($elm$html$Html$Attributes$style, 'transition-duration', '0.35s'),
			A2($elm$html$Html$Attributes$style, '-webkit-transition-property', 'height'),
			A2($elm$html$Html$Attributes$style, '-o-transition-property', 'height'),
			A2($elm$html$Html$Attributes$style, 'transition-property', 'height')
		]);
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$menuAttributes = F2(
	function (state, configRec) {
		var visibility = state.cZ;
		var height = state.d0;
		var defaults = _List_fromArray(
			[
				$elm$html$Html$Attributes$class('collapse navbar-collapse')
			]);
		switch (visibility) {
			case 0:
				if (height.$ === 1) {
					return ((!configRec.al) || A2($rundis$elm_bootstrap$Bootstrap$Navbar$shouldHideMenu, state, configRec)) ? defaults : _List_fromArray(
						[
							A2($elm$html$Html$Attributes$style, 'display', 'block'),
							A2($elm$html$Html$Attributes$style, 'height', '0'),
							A2($elm$html$Html$Attributes$style, 'overflow', 'hidden'),
							A2($elm$html$Html$Attributes$style, 'width', '100%')
						]);
				} else {
					return defaults;
				}
			case 1:
				return $rundis$elm_bootstrap$Bootstrap$Navbar$transitionStyle($elm$core$Maybe$Nothing);
			case 2:
				return _Utils_ap(
					$rundis$elm_bootstrap$Bootstrap$Navbar$transitionStyle(height),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$Events$on,
							'transitionend',
							A2($rundis$elm_bootstrap$Bootstrap$Navbar$transitionHandler, state, configRec))
						]));
			case 4:
				return _Utils_ap(
					$rundis$elm_bootstrap$Bootstrap$Navbar$transitionStyle($elm$core$Maybe$Nothing),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$Events$on,
							'transitionend',
							A2($rundis$elm_bootstrap$Bootstrap$Navbar$transitionHandler, state, configRec))
						]));
			case 3:
				return $rundis$elm_bootstrap$Bootstrap$Navbar$transitionStyle(height);
			default:
				return _Utils_ap(
					defaults,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('show')
						]));
		}
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$menuWrapperAttributes = F2(
	function (state, confRec) {
		var visibility = state.cZ;
		var height = state.d0;
		var styleBlock = _List_fromArray(
			[
				A2($elm$html$Html$Attributes$style, 'display', 'block'),
				A2($elm$html$Html$Attributes$style, 'width', '100%')
			]);
		var display = function () {
			if (height.$ === 1) {
				return ((!confRec.al) || A2($rundis$elm_bootstrap$Bootstrap$Navbar$shouldHideMenu, state, confRec)) ? 'flex' : 'block';
			} else {
				return 'flex';
			}
		}();
		switch (visibility) {
			case 0:
				return _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'display', display),
						A2($elm$html$Html$Attributes$style, 'width', '100%')
					]);
			case 1:
				return styleBlock;
			case 2:
				return styleBlock;
			case 4:
				return styleBlock;
			case 3:
				return styleBlock;
			default:
				return ((!confRec.al) || A2($rundis$elm_bootstrap$Bootstrap$Navbar$shouldHideMenu, state, confRec)) ? _List_fromArray(
					[
						$elm$html$Html$Attributes$class('collapse navbar-collapse show')
					]) : _List_fromArray(
					[
						A2($elm$html$Html$Attributes$style, 'display', 'block')
					]);
		}
	});
var $elm$html$Html$nav = _VirtualDom_node('nav');
var $rundis$elm_bootstrap$Bootstrap$Navbar$expandOption = function (size) {
	var toClass = function (sz) {
		return $elm$html$Html$Attributes$class(
			'navbar-expand' + A2(
				$elm$core$Maybe$withDefault,
				'',
				A2(
					$elm$core$Maybe$map,
					function (s) {
						return '-' + s;
					},
					$rundis$elm_bootstrap$Bootstrap$General$Internal$screenSizeOption(sz))));
	};
	switch (size) {
		case 0:
			return _List_fromArray(
				[
					toClass(1)
				]);
		case 1:
			return _List_fromArray(
				[
					toClass(2)
				]);
		case 2:
			return _List_fromArray(
				[
					toClass(3)
				]);
		case 3:
			return _List_fromArray(
				[
					toClass(4)
				]);
		default:
			return _List_Nil;
	}
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$fixOption = function (fix) {
	if (!fix) {
		return 'fixed-top';
	} else {
		return 'fixed-bottom';
	}
};
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$Basics$round = _Basics_round;
var $avh4$elm_color$Color$toCssString = function (_v0) {
	var r = _v0.a;
	var g = _v0.b;
	var b = _v0.c;
	var a = _v0.d;
	var roundTo = function (x) {
		return $elm$core$Basics$round(x * 1000) / 1000;
	};
	var pct = function (x) {
		return $elm$core$Basics$round(x * 10000) / 100;
	};
	return $elm$core$String$concat(
		_List_fromArray(
			[
				'rgba(',
				$elm$core$String$fromFloat(
				pct(r)),
				'%,',
				$elm$core$String$fromFloat(
				pct(g)),
				'%,',
				$elm$core$String$fromFloat(
				pct(b)),
				'%,',
				$elm$core$String$fromFloat(
				roundTo(a)),
				')'
			]));
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$backgroundColorOption = function (bgClass) {
	switch (bgClass.$) {
		case 0:
			var role = bgClass.a;
			return A2($rundis$elm_bootstrap$Bootstrap$Internal$Role$toClass, 'bg', role);
		case 1:
			var color = bgClass.a;
			return A2(
				$elm$html$Html$Attributes$style,
				'background-color',
				$avh4$elm_color$Color$toCssString(color));
		default:
			var classString = bgClass.a;
			return $elm$html$Html$Attributes$class(classString);
	}
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$linkModifierClass = function (modifier) {
	return $elm$html$Html$Attributes$class(
		function () {
			if (!modifier) {
				return 'navbar-dark';
			} else {
				return 'navbar-light';
			}
		}());
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$schemeAttributes = function (_v0) {
	var modifier = _v0.cb;
	var bgColor = _v0.bG;
	return _List_fromArray(
		[
			$rundis$elm_bootstrap$Bootstrap$Navbar$linkModifierClass(modifier),
			$rundis$elm_bootstrap$Bootstrap$Navbar$backgroundColorOption(bgColor)
		]);
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$navbarAttributes = function (options) {
	return _Utils_ap(
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('navbar', true),
						_Utils_Tuple2('container', options.b2)
					]))
			]),
		_Utils_ap(
			$rundis$elm_bootstrap$Bootstrap$Navbar$expandOption(options.bj),
			_Utils_ap(
				function () {
					var _v0 = options.cI;
					if (!_v0.$) {
						var scheme_ = _v0.a;
						return $rundis$elm_bootstrap$Bootstrap$Navbar$schemeAttributes(scheme_);
					} else {
						return _List_Nil;
					}
				}(),
				_Utils_ap(
					function () {
						var _v1 = options.at;
						if (!_v1.$) {
							var fix = _v1.a;
							return _List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									$rundis$elm_bootstrap$Bootstrap$Navbar$fixOption(fix))
								]);
						} else {
							return _List_Nil;
						}
					}(),
					options.aQ))));
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$renderCustom = function (items_) {
	return A2(
		$elm$core$List$map,
		function (_v0) {
			var item = _v0;
			return item;
		},
		items_);
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$getOrInitDropdownStatus = F2(
	function (id, _v0) {
		var dropdowns = _v0._;
		return A2(
			$elm$core$Maybe$withDefault,
			2,
			A2($elm$core$Dict$get, id, dropdowns));
	});
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$virtual_dom$VirtualDom$Custom = function (a) {
	return {$: 3, a: a};
};
var $elm$html$Html$Events$custom = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Custom(decoder));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$toggleOpen = F3(
	function (state, id, _v0) {
		var toMsg = _v0.eR;
		var currStatus = A2($rundis$elm_bootstrap$Bootstrap$Navbar$getOrInitDropdownStatus, id, state);
		var newStatus = function () {
			switch (currStatus) {
				case 0:
					return 2;
				case 1:
					return 2;
				default:
					return 0;
			}
		}();
		return toMsg(
			A2(
				$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
				function (s) {
					return _Utils_update(
						s,
						{
							_: A3($elm$core$Dict$insert, id, newStatus, s._)
						});
				},
				state));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$renderDropdownToggle = F4(
	function (state, id, configRec, _v0) {
		var attributes = _v0.aQ;
		var children = _v0.aS;
		return A2(
			$elm$html$Html$a,
			_Utils_ap(
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('nav-link dropdown-toggle'),
						$elm$html$Html$Attributes$href('#'),
						A2(
						$elm$html$Html$Events$custom,
						'click',
						$elm$json$Json$Decode$succeed(
							{
								P: A3($rundis$elm_bootstrap$Bootstrap$Navbar$toggleOpen, state, id, configRec),
								dn: true,
								dw: false
							}))
					]),
				attributes),
			children);
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$renderDropdown = F3(
	function (state, configRec, _v0) {
		var ddRec = _v0;
		var needsDropup = A2(
			$elm$core$Maybe$withDefault,
			false,
			A2(
				$elm$core$Maybe$map,
				function (fix) {
					if (fix === 1) {
						return true;
					} else {
						return false;
					}
				},
				configRec.fr.at));
		var isShown = A2($rundis$elm_bootstrap$Bootstrap$Navbar$getOrInitDropdownStatus, ddRec.j, state) !== 2;
		return A2(
			$elm$html$Html$li,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('nav-item', true),
							_Utils_Tuple2('dropdown', true),
							_Utils_Tuple2('shown', isShown),
							_Utils_Tuple2('dropup', needsDropup)
						]))
				]),
			_List_fromArray(
				[
					A4($rundis$elm_bootstrap$Bootstrap$Navbar$renderDropdownToggle, state, ddRec.j, configRec, ddRec.eS),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('dropdown-menu', true),
									_Utils_Tuple2('show', isShown)
								]))
						]),
					A2(
						$elm$core$List$map,
						function (_v1) {
							var item = _v1;
							return item;
						},
						ddRec.fi))
				]));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$renderItemLink = function (_v0) {
	var attributes = _v0.aQ;
	var children = _v0.aS;
	return A2(
		$elm$html$Html$li,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('nav-item')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$a,
				_Utils_ap(
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('nav-link')
						]),
					attributes),
				children)
			]));
};
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $rundis$elm_bootstrap$Bootstrap$Navbar$renderNav = F3(
	function (state, configRec, navItems) {
		return A2(
			$elm$html$Html$ul,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('navbar-nav mr-auto')
				]),
			A2(
				$elm$core$List$map,
				function (item) {
					if (!item.$) {
						var item_ = item.a;
						return $rundis$elm_bootstrap$Bootstrap$Navbar$renderItemLink(item_);
					} else {
						var dropdown_ = item.a;
						return A3($rundis$elm_bootstrap$Bootstrap$Navbar$renderDropdown, state, configRec, dropdown_);
					}
				},
				navItems));
	});
var $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$parentElement = function (decoder) {
	return A2($elm$json$Json$Decode$field, 'parentElement', decoder);
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$heightDecoder = function () {
	var tagDecoder = A3(
		$elm$json$Json$Decode$map2,
		F2(
			function (tag, val) {
				return _Utils_Tuple2(tag, val);
			}),
		A2($elm$json$Json$Decode$field, 'tagName', $elm$json$Json$Decode$string),
		$elm$json$Json$Decode$value);
	var resToDec = function (res) {
		if (!res.$) {
			var v = res.a;
			return $elm$json$Json$Decode$succeed(v);
		} else {
			var err = res.a;
			return $elm$json$Json$Decode$fail(
				$elm$json$Json$Decode$errorToString(err));
		}
	};
	var fromNavDec = $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['childNodes', '2', 'childNodes', '0', 'offsetHeight']),
				$elm$json$Json$Decode$float),
				A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['childNodes', '1', 'childNodes', '0', 'offsetHeight']),
				$elm$json$Json$Decode$float)
			]));
	var fromButtonDec = $rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$parentElement(fromNavDec);
	return A2(
		$elm$json$Json$Decode$andThen,
		function (_v0) {
			var tag = _v0.a;
			var val = _v0.b;
			switch (tag) {
				case 'NAV':
					return resToDec(
						A2($elm$json$Json$Decode$decodeValue, fromNavDec, val));
				case 'BUTTON':
					return resToDec(
						A2($elm$json$Json$Decode$decodeValue, fromButtonDec, val));
				default:
					return $elm$json$Json$Decode$succeed(0);
			}
		},
		$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$target(
			$rundis$elm_bootstrap$Bootstrap$Utilities$DomHelper$parentElement(tagDecoder)));
}();
var $rundis$elm_bootstrap$Bootstrap$Navbar$toggleHandler = F2(
	function (state, configRec) {
		var height = state.d0;
		var updState = function (h) {
			return A2(
				$rundis$elm_bootstrap$Bootstrap$Navbar$mapState,
				function (s) {
					return _Utils_update(
						s,
						{
							d0: $elm$core$Maybe$Just(h),
							cZ: A2($rundis$elm_bootstrap$Bootstrap$Navbar$visibilityTransition, configRec.al, s.cZ)
						});
				},
				state);
		};
		return A2(
			$elm$html$Html$Events$on,
			'click',
			A2(
				$elm$json$Json$Decode$andThen,
				function (v) {
					return $elm$json$Json$Decode$succeed(
						configRec.eR(
							(v > 0) ? updState(v) : updState(
								A2($elm$core$Maybe$withDefault, 0, height))));
				},
				$rundis$elm_bootstrap$Bootstrap$Navbar$heightDecoder));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$view = F2(
	function (state, conf) {
		var configRec = conf;
		return A2(
			$elm$html$Html$nav,
			$rundis$elm_bootstrap$Bootstrap$Navbar$navbarAttributes(configRec.fr),
			_Utils_ap(
				$rundis$elm_bootstrap$Bootstrap$Navbar$maybeBrand(configRec.aR),
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'navbar-toggler' + A2(
										$elm$core$Maybe$withDefault,
										'',
										A2(
											$elm$core$Maybe$map,
											function (_v0) {
												return ' navbar-toggler-right';
											},
											configRec.aR))),
									$elm$html$Html$Attributes$type_('button'),
									A2($rundis$elm_bootstrap$Bootstrap$Navbar$toggleHandler, state, configRec)
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('navbar-toggler-icon')
										]),
									_List_Nil)
								]))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							A2($rundis$elm_bootstrap$Bootstrap$Navbar$menuAttributes, state, configRec),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									A2($rundis$elm_bootstrap$Bootstrap$Navbar$menuWrapperAttributes, state, configRec),
									_Utils_ap(
										_List_fromArray(
											[
												A3($rundis$elm_bootstrap$Bootstrap$Navbar$renderNav, state, configRec, configRec.fi)
											]),
										$rundis$elm_bootstrap$Bootstrap$Navbar$renderCustom(configRec.bQ)))
								]))
						]))));
	});
var $rundis$elm_bootstrap$Bootstrap$Navbar$CustomItem = $elm$core$Basics$identity;
var $rundis$elm_bootstrap$Bootstrap$Navbar$customItem = function (elem) {
	return elem;
};
var $author$project$Main$viewNavbarItem = function (props) {
	return $rundis$elm_bootstrap$Bootstrap$Navbar$customItem(
		A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					props.ai,
					$elm$html$Html$Attributes$href(props.ad),
					$elm$html$Html$Attributes$target('_blank')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$img,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$src(
							_Utils_ap($author$project$Settings$iconUrl, props.i)),
							$elm$html$Html$Attributes$class('d-inline-block align-top'),
							A2($elm$html$Html$Attributes$style, 'width', '25px'),
							$elm$html$Html$Attributes$title(props.dC)
						]),
					_List_Nil)
				])));
};
var $rundis$elm_bootstrap$Bootstrap$Navbar$withAnimation = function (config_) {
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Navbar$updateConfig,
		function (conf) {
			return _Utils_update(
				conf,
				{al: true});
		},
		config_);
};
var $author$project$Main$viewNavbar = function (model) {
	var tabLink = function (tab) {
		var selectedClass = _Utils_eq(model.p.a, tab) ? 'nav-link active' : 'nav-link';
		return _List_fromArray(
			[
				$elm$html$Html$Attributes$class(selectedClass),
				$elm$html$Html$Attributes$href('#'),
				$elm$html$Html$Events$onClick(
				$author$project$Main$SwitchTab(tab))
			]);
	};
	var previewUrl = A2(
		$elm$core$String$join,
		'/',
		_List_fromArray(
			[
				'view',
				$elm$core$String$fromInt(model.b.j),
				$elm$core$String$fromInt(model.b.dR)
			]));
	var metaDataUrl = 'profile/show-exposition?exposition=' + $elm$core$String$fromInt(model.b.j);
	return A2(
		$rundis$elm_bootstrap$Bootstrap$Navbar$view,
		model.bb,
		A2(
			$rundis$elm_bootstrap$Bootstrap$Navbar$customItems,
			_List_fromArray(
				[
					$author$project$Main$viewNavbarItem(
					{i: 'question.svg', ad: 'https://guide.researchcatalogue.net/#text-based-editor', ai: $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml0, dC: 'Help'}),
					$author$project$Main$viewNavbarItem(
					{i: 'pencil.svg', ad: metaDataUrl, ai: $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml3, dC: 'Show/edit metadata'}),
					$author$project$Main$viewNavbarItem(
					{i: 'eye_metro.svg', ad: previewUrl, ai: $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml3, dC: 'Preview'}),
					$author$project$Main$viewNavbarItem(
					{i: 'profile_metro.svg', ad: 'profile', ai: $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml3, dC: 'Profile'}),
					$author$project$Main$viewNavbarItem(
					{i: 'logout_metro.svg', ad: 'session/logout', ai: $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml3, dC: 'Logout'})
				]),
			A2(
				$rundis$elm_bootstrap$Bootstrap$Navbar$items,
				_List_fromArray(
					[
						A2(
						$rundis$elm_bootstrap$Bootstrap$Navbar$itemLink,
						_Utils_ap(
							_List_fromArray(
								[$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$ml0]),
							tabLink(0)),
						_List_fromArray(
							[
								$elm$html$Html$text('Markdown')
							])),
						A2(
						$rundis$elm_bootstrap$Bootstrap$Navbar$itemLink,
						tabLink(2),
						_List_fromArray(
							[
								$elm$html$Html$text('Media')
							])),
						A2(
						$rundis$elm_bootstrap$Bootstrap$Navbar$itemLink,
						tabLink(1),
						_List_fromArray(
							[
								$elm$html$Html$text('Style')
							]))
					]),
				$rundis$elm_bootstrap$Bootstrap$Navbar$collapseMedium(
					$rundis$elm_bootstrap$Bootstrap$Navbar$withAnimation(
						A2(
							$rundis$elm_bootstrap$Bootstrap$Navbar$attrs,
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$style, 'padding-left', '0')
								]),
							$rundis$elm_bootstrap$Bootstrap$Navbar$config($author$project$Main$NavbarMsg)))))));
};
var $author$project$Util$classListFromString = A2(
	$elm$core$Basics$composeL,
	$elm$core$List$map(
		function (str) {
			return $elm$html$Html$Attributes$class(str);
		}),
	$elm$core$String$split(' '));
var $author$project$Main$viewUpload = F2(
	function (buttonInfo, status) {
		if (!status.$) {
			return $author$project$View$mkButton(buttonInfo);
		} else {
			var fraction = status.a;
			var uploadStatusMessage = (fraction < 0.99) ? ($elm$core$String$fromInt(
				$elm$core$Basics$round(100 * fraction)) + '%') : 'processing..';
			var uploadCssClasses = $author$project$Util$classListFromString('upload-percentage btn btn-outline-dark m-0 mb-1 mt-1 mr-1');
			return A2(
				$elm$html$Html$div,
				uploadCssClasses,
				_List_fromArray(
					[
						$elm$html$Html$text(uploadStatusMessage)
					]));
		}
	});
var $author$project$Main$view = function (model) {
	var uploadMediaButtonInfo = function () {
		var bttn = $author$project$View$defaultButton($author$project$Main$UploadMediaFileSelect);
		return _Utils_update(
			bttn,
			{
				i: 11,
				ej: true,
				dj: _List_fromArray(
					[
						$elm$html$Html$Attributes$class('soft-blue-background'),
						$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mb1,
						$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mt1,
						$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mr1
					]),
				ep: true,
				aI: 'Upload Media',
				dC: 'Add media files: images, video, audio or pdf'
			});
	}();
	var uploadButtonHtml = A2($author$project$Main$viewUpload, uploadMediaButtonInfo, model.aA);
	var showMediaUpload = $author$project$Main$selectedEditorIsMarkdown(model);
	var showButtons = $author$project$Main$selectedEditorIsMarkdown(model);
	var previewButton = function () {
		var weave = model.b.dR;
		var researchId = model.b.j;
		var previewUrl = A2(
			$elm$core$String$join,
			'/',
			_List_fromArray(
				[
					'view',
					$elm$core$String$fromInt(researchId),
					$elm$core$String$fromInt(weave)
				]));
		return A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$href(previewUrl),
					$elm$html$Html$Attributes$target('_blank'),
					$elm$html$Html$Attributes$class('btn btn-link ml-1')
				]),
			_List_fromArray(
				[
					$author$project$View$renderIcon(12)
				]));
	}();
	var mediaList = A2(
		$elm$html$Html$map,
		$author$project$Main$MediaList,
		A3(
			$author$project$RCMediaList$mediaListView,
			model.a8,
			model.b.n,
			$author$project$Main$makeTableMessages(uploadButtonHtml)));
	var mediaDialogHtml = A5($author$project$RCMediaEdit$view, $author$project$Main$makeMediaEditFun, $author$project$Main$CloseMediaDialog, $author$project$Main$InsertMediaAtCursor, model.b, model.D);
	var importDocButtonInfo = function () {
		var bttn = $author$project$View$defaultButton($author$project$Main$UploadImportFileSelect);
		return _Utils_update(
			bttn,
			{
				i: 1,
				ej: true,
				dj: _List_fromArray(
					[$rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mb1, $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mt1, $rundis$elm_bootstrap$Bootstrap$Utilities$Spacing$mr1]),
				ep: true,
				aI: 'Import Doc',
				dC: 'Import external documents (Word, Open office, Markdown, LaTeX etc..'
			});
	}();
	var editorToolbar = $author$project$Main$mkEditorToolbar(
		$author$project$Main$getTabState(model.p));
	var editorCheckbox = function () {
		var _v1 = model.p;
		if (!_v1.a) {
			var _v2 = _v1.a;
			var markdownEditor = _v1.b;
			return $author$project$Main$viewEditorCheckbox(markdownEditor);
		} else {
			return A2($elm$html$Html$span, _List_Nil, _List_Nil);
		}
	}();
	var confirmDialogHtml = $author$project$UserConfirm$view(model.aq);
	var alert = function () {
		var _v0 = model.H;
		if (!_v0.b) {
			return A2($elm$html$Html$span, _List_Nil, _List_Nil);
		} else {
			return $author$project$Main$viewAlert(model);
		}
	}();
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				$author$project$Main$viewNavbar(model),
				mediaDialogHtml,
				confirmDialogHtml,
				A2(
				$elm$html$Html$map,
				$author$project$Main$MediaPicker,
				A3(
					$author$project$RCMediaList$mediaPickerView,
					model.r,
					model.b.n,
					$author$project$Main$makePickerConfig(uploadButtonHtml))),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('btn-toolbar'),
						$elm$html$Html$Attributes$class('import-export-toolbar'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'toolbar')
					]),
				_List_fromArray(
					[
						A2(
						$author$project$View$optionalBlock,
						showMediaUpload,
						A2($author$project$Main$viewUpload, uploadMediaButtonInfo, model.aA)),
						A2(
						$author$project$View$optionalBlock,
						showButtons,
						A2($author$project$Main$viewUpload, importDocButtonInfo, model.a1)),
						A2(
						$author$project$View$optionalBlock,
						showButtons,
						A5(
							$author$project$View$mkDropdown,
							model.aZ,
							$author$project$Main$ExportDropMsg,
							'Export Doc',
							_List_fromArray(
								[
									_Utils_Tuple2(
									'doc',
									$author$project$Main$ConvertExposition(1)),
									_Utils_Tuple2(
									'pdf',
									$author$project$Main$ConvertExposition(0)),
									_Utils_Tuple2(
									'epub',
									$author$project$Main$ConvertExposition(6)),
									_Utils_Tuple2(
									'odt',
									$author$project$Main$ConvertExposition(2)),
									_Utils_Tuple2(
									'latex',
									$author$project$Main$ConvertExposition(3)),
									_Utils_Tuple2(
									'html',
									$author$project$Main$ConvertExposition(4)),
									_Utils_Tuple2(
									'markdown',
									$author$project$Main$ConvertExposition(5))
								]),
							'Export the current exposition'))
					])),
				A2(
				$author$project$View$optionalBlock,
				showButtons,
				A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('toolbar'),
							$elm$html$Html$Attributes$class('markdown-toolbar')
						]),
					A2(
						$elm$core$List$append,
						editorToolbar,
						_List_fromArray(
							[
								editorCheckbox,
								$author$project$Main$viewFullscreenSwitch(model.bV)
							])))),
				alert,
				mediaList,
				A2(
				$author$project$Main$statusBar,
				$author$project$Main$selectedEditorIsMarkdown(model),
				model)
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{fg: $author$project$Main$init, fy: $author$project$Main$subscriptions, fB: $author$project$Main$update, fC: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}});}(this));