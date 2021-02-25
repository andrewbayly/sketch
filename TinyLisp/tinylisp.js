  /**
  TODO:
    1. is there a way to interpret more than one expression at a time?? - DONE!
    
    2. expand the library: 
        and - DONE
        or - DONE
        > - DONE 
        < - DONE
        = - DONE
        != - DONE
        <= - DONE
        >= - DONE  
        - - DONE
        + - DONE 
        * - DONE
        / - DONE 
        expt - DONE
        
    
    3. fill out the special forms: 
       - define - DONE!
       - begin - DONE! 
       - if - DONE!
       - while - DONE!
       - call-method - DONE!  
       - define-method - Still need to test! 
       - new - DONE! 
       - var - DONE!
       - assign - DONE!
       
       - access - DONE!
       - array - DONE!
       - [object]
       
       - grid[x][y] 
       
         (assign (access grid x y) 5)
         (print (access grid x y) )
         
         (assign grid 
           (array 
             (array 0 1 0 1)   
             (array 0 1 0 1)   
             (array 0 1 0 1)   
             (array 0 1 0 1)
           )
         )
       
         (assign grid 
           (object 
             "a" 1   
             "b" 2   
             "c" 3   
             "d" 4
           )
         )
       
    // assignment: 
    //  - var x = 1 (var x 1)    //creates local variable and assigns it
    //  - x = 1    (assign x 1)  //modifies existing (or global variable)   
       
       
    4. add set/get to Object and Array - DONE!
    
    5. wrap the library in a class - DONE! 
    
    6. Bug: for some reason colorMode doesn't work!
    
    7. comments! ; ...
  
  Gotchas I found while working with TinyLisp: 
    - while only works with one expression, not a list of expressions
    - make sure your braces are matched!
    - var or assign? Are you using the right one?
  **/
  
  
//-------------------------------------------------------------------------
// TinyLisp
// based on https://maryrosecook.com/blog/post/little-lisp-interpreter
// by Mary Rose Cook
//-------------------------------------------------------------------------
  
function TinyLisp(){ 
}
  
TinyLisp.prototype.load = function(input){ 
  this.evaluate(input); 
}
  
TinyLisp.prototype.evaluate = function(input){ 
  //console.log(input)
  var program = this.parse(this.enclose(input))
  //console.log(program)
  var js = program.map( x => this.convert(x) ).join("\n")
  console.log(js)
  eval(js)
}
  
TinyLisp.prototype.enclose = function(input){ 
  return "\n(\n" + input + "\n)\n" ; 
}

TinyLisp.prototype.initialize = function(){

  var library = { 
    print: function(x) {
      console.log(x);
      return x;
    }, 
    
    "/": (a, b) => (a / b), 
    
    "-": (a, b) => (a - b), 

    "*": function(){ 
      var product = 1; 
      for(var i = 0; i < arguments.length; i++){ 
        product = product * arguments[i]; 
      }
      return product
    }, 
    
    "+": function(){ 
      var sum = 0; 
      for(var i = 0; i < arguments.length; i++){ 
        sum = sum + arguments[i]; 
      }
      return sum
    }, 

    ">": (a, b) => (a > b), 
    "<": (a, b) => (a < b), 
    "=": (a, b) => (a == b), 
    "!=": (a, b) => (a != b), 
    "<=": (a, b) => (a <= b), 
    ">=": (a, b) => (a >= b), 
    "and": (a, b) => (a && b), 
    "or": (a, b) => (a || b), 
    "expt": (a, b) => (Math.pow(a,b)) 
  }
  
  for(var i in library){ 
    window[i] = library[i]
  }
  
  this.special = {
    
    //(if condition t-result f-result)
    "if" : function(input){ 
      return this.convert(input[1]) + " ? " 
           + this.convert(input[2]) + " : "
           + this.convert(input[3]) 
    }, 

    //(assign variable value)
    "assign" : function(input){ 
      return this.convert(input[1]) + " = " 
           + this.convert(input[2])  
    },

    //(var variable value) //note that var doesn't return a value ( and so can't be the last statement in a block)
    "var" : function(input){ 
      return "var " + this.convert(input[1]) + " = " 
           + this.convert(input[2])  
    }, 
    
    //(new ctor args...)
    "new" : function(input){ 
      return "new " + this.convert(input[1]) + "(" 
             + input.slice(2).map((x) => this.convert(x)).join(',') + ")"   
    }, 
    
    //(call-method obj method-name args...)
    "call-method" : function(input){
      return this.convert(input[1]) + "['" 
           + this.convert(input[2]) + "']"
           + "(" + input.slice(3).map((x) => this.convert(x)).join(',') + ")"
    }, 
    
    //defines a function which returns the value of the last expression in the list
    //(define (function-name args...) expressions...)
    "define" : function(input){ 
      //console.log(input)
      var body = input.slice(2).map((x) => this.convert(x))
      body[body.length-1] = "return " + body[body.length-1]
      
      var args = input[1].slice(1).map((x) => this.convert(x))
      
      var functionName = input[1][0]; 
      
      return "window['" + functionName + "']=function(" + args.join(',') + "){\n  "
           + body.join(';\n  ') + "\n}" 
    }, 

    //note: define-method is almost the same as define
    //      would be nice to re-use the code! 
    //(define-method ctor-name (function-name args...) expressions...)
    "define-method" : function(input){ 
      var body = input.slice(3).map((x) => this.convert(x))
      body[body.length-1] = "return " + body[body.length-1]
      
      var args = input[2].slice(1).map((x) => this.convert(x))
      
      var functionName = input[2][0]; 
      
      var ctorName = input[1];
    
      return "window['" + ctorName + "'].prototype['" + functionName + "']=function(" + args.join(',') + "){"
           + body.join(';\n') + "}" 
    }, 
    
    //(begin expressions...)
    "begin" : function(input){ 
      var body = input.slice(1).map((x) => this.convert(x))
      body[body.length-1] = "return " + body[body.length-1]
    
      return "(function(){\n  " + body.join(';\n  ') + "\n})()" 
    },  
    
    //(while cond body)
    "while" : function(input){ 
      var body = this.convert(input[2])
      var cond = this.convert(input[1])
      
      return "(function(){\n  " + "while(" + cond + "){\n" + body + "\n}"+ "\n})()" 
    }, 
    
    //(array expressions...)
    "array" : function(input){
      return "[" + input.slice(1).map((x) => this.convert(x)).join(',') + "]"
    },

    //(access var expressions)    
    "access" : function(input){
      return this.convert(input[1]) + input.slice(2).map((x) => "[" + this.convert(x) + "]").join('') 
    }
 
  }
}
 
TinyLisp.prototype.parse = function(input) {
  return this.parenthesize(this.tokenize(input));
}

TinyLisp.prototype.parenthesize = function(input, list) {
  if (list === undefined) {
    return this.parenthesize(input, []);
  } else {
    var token = input.shift();
    if (token === undefined) {
      return list.pop();
    } else if (token === "(") {
      list.push(this.parenthesize(input, []));
      return this.parenthesize(input, list);
    } else if (token === ")") {
      return list;
    } else {
      return this.parenthesize(input, list.concat(token));
    }
  }
}

TinyLisp.prototype.tokenize = function(input) {
  return input.split('"')
              .map(function(x, i) {
                 if (i % 2 === 0) { // not in string
                   return x.replace(/\(/g, ' ( ')
                           .replace(/\)/g, ' ) ');
                 } else { // in string
                   return x.replace(/ /g, "!whitespace!");
                 }
               })
              .join('"')
              .trim()
              .split(/\s+/)
              .map(function(x) {
                return x.replace(/!whitespace!/g, " ");
              });
}
  
TinyLisp.prototype.convert = function(input) { 
  if (input instanceof Array) {
    return this.convertList(input)
  } else { 
    return input
  }
}
  
TinyLisp.prototype.convertList = function(input) { 
  if (input.length > 0 && input[0] in this.special) {
    return this.special[input[0]].apply(this, [input])
  } else {
    var list = input.map(x => this.convert(x))
    //if (window[list[0]] instanceof Function) {
      return "window['" + list[0] + "'](" + list.slice(1).join(",") + ")" 
    //} else {
    //  return list; //this is kind of redundant - shouldn't get here, should we???
    //}
  }
}

Object.prototype.setValue = function(property, val){ 
  this[property] = val 
}

Object.prototype.getValue = function(property){ 
  return this[property] 
}

var tiny = new TinyLisp()
tiny.initialize()


