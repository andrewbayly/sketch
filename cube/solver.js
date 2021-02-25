/******************************************************************************************
Solver
******************************************************************************************/

/**

1. support 2x2 and 3x3 and 4x4

moving to 4...

1. reduce faces
2. reduce edges
3. check parity and fix
4. solve 3x3

**/

function Solver(){ 
  this.solving = false; 
}

Solver.prototype.solve = function(){ 
  this.solving = true;  
  this.stepCount = 0; 
}

/**
  returns the sequence of faces that match 
  the colors provided. Note that colors is 
  expected to be a sorted sequence of color indexes.
**/
Solver.prototype.find = function(colors){ 

  var cube = null; 
  for(var i = 0; i < cubes.length; i++){ 
    cube = cubes[i]; 
    if(cube.colors == colors)
      break; 
  }
  
  var faces = cube.getFaces(colors); 
  
  return faces ; 
}  

/**
find is fine for the 3x3, but when we move to 4x4, we have multiple matches for
a specific set of colors, so - we have a new function findFaces which returns
all the cubies that match the given color - let's try it and see if it works!

what I really want is a structure like this: 

face, x, y, for each cube. 

Note that x, y are re-oriented based on the view of the cube


**/

Solver.prototype.findFaceCubies = function(color){ 
  var qbs = []; 
  for(var i = 0; i < cubes.length; i++){ 
    qb = cubes[i]; 
    if(qb.colors == color)
      qbs.push(qb); 
  }
  
  var result = []; 
  
  for(var i = 0; i < qbs.length; i++){ 
    var qb = qbs[i]; 
    var face = qb.getFaces(color)

    var x = 0; 
    var y = 0; 
    
    switch(face){ 
      case 'F': 
        x = qb.pos.x < 0 ? 0 : 1; 
        y = qb.pos.y < 0 ? 0 : 1; 
        break; 
      case 'B': 
        x = qb.pos.x < 0 ? 1 : 0; 
        y = qb.pos.y < 0 ? 0 : 1; 
        break; 
      case 'L': 
        x = qb.pos.z < 0 ? 0 : 1; 
        y = qb.pos.y < 0 ? 0 : 1; 
        break; 
      case 'R': 
        x = qb.pos.z < 0 ? 1 : 0; 
        y = qb.pos.y < 0 ? 0 : 1; 
        break; 
      case 'U': 
        x = qb.pos.x < 0 ? 0 : 1; 
        y = qb.pos.z < 0 ? 0 : 1; 
        break; 
      case 'D': 
        x = qb.pos.x < 0 ? 0 : 1; 
        y = qb.pos.z < 0 ? 1 : 0; 
        break; 
    }
    
    var obj = {face: face, x:x, y:y}; 
    result.push(obj);  
       
  }

  return result; 
}

  
Solver.prototype.actionSteps = [ 

/*--------------------------------------------------------------------------------
preliminary steps for 3x3 orienting face cubies
--------------------------------------------------------------------------------*/

  function(){
    if(cubeSize != 3)
      return; 
  
    var pos = this.find('0'); //white
    
    var map = { 'U' : 'L1', 'F' : '', 'D' : 'l1', 'B' : 'l1l1', 'L' : 'u1', 'R' : 'U1' }  
    
    this.makeMoves( map[pos] );     
  
  }, 

  function(){
    if(cubeSize != 3)
      return; 

    var pos = this.find('3'); //red
    
    var map = { 'U' : '', 'D' : 'f1f1', 'L' : 'F1', 'R' : 'f1' }  
    
    this.makeMoves( map[pos] );     
 },  
    
/*--------------------------------------------------------------------------------
these steps are for the 4x4
--------------------------------------------------------------------------------*/

  //first steps... put the 1st white face cubies on the white face in position 0,0
  function(){ 
    if(cubeSize != 4)
      return; 
  
    var f = this.findFaceCubies('0'); 
    
    //alert(JSON.stringify(f)); 
    
    //lets choose the first cube, and position that!
    var q = f[0]; 
    
    var t = [0, 1, 3, 2][q.y*2+q.x]; 
    
    var twist = this.flip(q.face); 
    
    for(var i = 0; i < t; i++)
      this.makeMoves(twist); 
      
    var p = { F : '', B : 'u1u1', L : 'u1', R : 'U1', U : 'L1', D : 'l1'} ; 
    
    this.makeMoves(p[q.face]);   
  }, 

  //... now the second qb: 
  function(){
    if(cubeSize != 4)
      return; 
  
    var f = this.findFaceCubies('0'); 

    //at this point we can assume that f[0] is in the correct place, 
    //so we pick f[1], and position that: 
    
    var q = f[1]; 
    
    //this is similar to the prior step, except for the case
    //where this cube is already on the front.
    
  
  }, 


  //temporary fix to stop us from doing the 3x3 solve too soon
  //and allow us to debug the 4x4 steps
  function(){
    if(cubeSize != 4)
      return; 

    this.end(); 
  }, 

/*--------------------------------------------------------------------------------
remainder of steps for the 3x3 or the reduced 4x4 ( and 2x2 - corners only )
--------------------------------------------------------------------------------*/

  /**
    steps 0-3 position the 4 edges with white faces correctly on the 
    white face.
  **/

  function(){
    if(cubeSize == 2)
      return; 

    var pos = this.find('03');  //white-red
    
    var map = {
      'FU' : '',    'FR' : 'f',   'FD' : 'ff',   'FL' : 'F',  
      'UF' : 'urf', 'UR' : 'rf',  'UB' : 'Urf',  'UL' : 'uurf',  
      'RU' : 'U',   'RF' : 'RU',  'RD' : 'rrU',  'RB' : 'rU',  
      'LU' : 'u',   'LF' : 'lu',  'LD' : 'llu',  'LB' : 'Lu',  
      'DF' : 'dlF', 'DR' : 'ddlF','DB' : 'DlF',  'DL' : 'lF',  
      'BU' : 'UU',  'BR' : 'BUU', 'BD' : 'BBUU', 'BL' : 'bUU'  
    }; 
    
    this.makeMoves( map[pos] );     
  },
  
  function(){ 
    if(cubeSize == 2)
      return; 

    var pos = this.find('04');  //white-green
    
    var map = {
                    'FR' : '',    'FD' : 'Ufu',  'FL' : 'Uffu',  
                    'UR' : 'r',   'UB' : 'fUFr', 'UL' : 'fuuFr',  
      'RU' : 'fUF', 'RF' : 'RfUF','RD' : 'RRfUF','RB' : 'rfUF',  
      'LU' : 'fuF', 'LF' : 'lfuF','LD' : 'llfuF','LB' : 'LfuF',  
      'DF' : 'DR',  'DR' : 'R',   'DB' : 'dR',   'DL' : 'ddR',  
      'BU' : 'brr', 'BR' : 'rr',  'BD' : 'Brr',  'BL' : 'bbrr'  
    }; 
    
    this.makeMoves( map[pos] ); 
  },
  
  function(){
    if(cubeSize == 2)
      return; 

     var pos = this.find('02');  //white-orange
    
    var map = {
                                  'FD' : '',     'FL' : 'llBdd',  
                    'UR' : 'frF', 'UB' : 'ffUFrF','UL' : 'ffUUFrF',  
      'RU' : 'fRRFd',             'RD' : 'd',    'RB' : 'fRFd',  
      'LU' : 'LLD', 'LF' : 'LD',  'LD' : 'D',    'LB' : 'lD',  
      'DF' : 'dFlf','DR' : 'ddFlf','DB' : 'DFlf','DL' : 'Flf',  
      'BU' : 'bbdd', 'BR' : 'bdd',  'BD' : 'dd',  'BL' : 'Bdd'  
    }; 
    
    this.makeMoves( map[pos] ); 
  },
  
  function(){ 
    if(cubeSize == 2)
      return; 

    var pos = this.find('05');  //white-blue
    
    var map = {
                                                  'FL' : '',  
                    'UR' :'FuufL', 'UB' : 'FufL', 'UL' : 'L',  
      'RU' : 'ffRfBufL',           'RD' :'ffrfBufL','RB' : 'FBufL',  
      'LU' : 'lFbufL','LF' :'llFbufL','LD' :'LFbufL','LB' :'FbufL',  
                    'DR' : 'fddFl','DB' : 'fDFl', 'DL' : 'l',  
      'BU' : 'Bll', 'BR' : 'bbll', 'BD' : 'bll',   'BL' : 'll'  
    }; 
    
    this.makeMoves( map[pos] ); 

  },  
  
 /**
    solve the white corner pieces: 
    for each corner:
      ( unless solved )
      - if it's position includes front, then move to back.
      - orient corner below intended positon
      - re-position corner in white face
  **/

  function(){ 
    this.row1_corner_step1('025'); 
  }, 
  
  function(){ 
    this.row1_corner_step2('025'); 
  }, 
  
  function(){ 
    this.row1_corner_step3('025'); 
  }, 
  
  
  function(){ 
    this.row1_corner_step1('035'); 
  }, 
  
  function(){ 
    this.row1_corner_step2('035'); 
  }, 
  
  function(){ 
    this.row1_corner_step3('035'); 
  }, 
  
  
  function(){ 
    this.row1_corner_step1('034'); 
  }, 
  
  function(){ 
    this.row1_corner_step2('034'); 
  }, 
  
  function(){ 
    this.row1_corner_step3('034'); 
  }, 
  
  
  function(){ 
    this.row1_corner_step1('024'); 
  }, 
  
  function(){ 
    this.row1_corner_step2('024'); 
  }, 
  
  function(){ 
    this.row1_corner_step3('024'); 
  },  
  
 /**
    second row: 
    for each edge:
      ( unless solved )
      - if qb is in second row, then remove it.
      - move into correct location
 **/
  
  function(){ 
    this.row2_edge_step1('25'); 
  }, 
  
  function(){ 
    this.row2_edge_step2('25'); 
  }, 
  
  function(){ 
    this.row2_edge_step1('35'); 
  }, 
  function(){ 
    this.row2_edge_step2('35'); 
  }, 

  function(){ 
    this.row2_edge_step1('34'); 
  }, 
  function(){ 
    this.row2_edge_step2('34'); 
  }, 

  function(){ 
    this.row2_edge_step1('24'); 
  }, 
  function(){ 
    this.row2_edge_step2('24'); 
  }, 
  
/****
  edges: re-orient (one step) 
    - identify four qb's to find: 12 13 14 15
    - find the positions
    - sort the positions in order of position ( not qb order ). 
      giving an array of boolean values
    loop:
      - move to the first false value (applying move(b) for each pos)
      - wind
      - move the next false value
      - unwind
****/
  function(){ 
    if(cubeSize == 2)
      return; 
  
    var qb = [ '13', '15', '12', '14' ]; 
    
    var pos = []; 
    for(var i = 0; i < qb.length; i++){ 
      pos.push( this.find(qb[i]) );  
    }
    
    var posStr = pos.join('_'); 
    
    var correctPositions = [ 'BU', 'BL', 'BD', 'BR' ] 
    
    var cMap = []; 
    for(var i = 0; i < correctPositions.length; i++){ 
      cMap.push( posStr.includes( correctPositions[i] ) );  
    }
    
    var m0 = 'RluurLFRlurL' ; 
    
    var m1 = this.reverse(m0);
    
    var m = [ m0, m1 ] ; 
    
    var mIndex = 0; 
    for(var i = 0; i < cMap.length; i++){ 
      if( !cMap[i] ){ 
        this.makeMoves( m[mIndex] ); 
        mIndex = 1 - mIndex ; 
      }
      this.makeMoves( 'b' ); 
    }
  }, 
  
/****
  edges: re-position 
****/
  function(){ 
    if(cubeSize == 2)
      return; 
  
    var qb = [ '13', '15', '12', '14' ]; 
    
    var pos = []; 
    for(var i = 0; i < qb.length; i++){ 
      pos.push( this.find(qb[i]) );  
    }
    
    //console.log(pos); 
    
    var correctPositions = [ 'BU', 'BL', 'BD', 'BR' ] 
    
    var correctIndexMap = {}; 
    for(var i = 0 ; i < correctPositions.length; i++){ 
      correctIndexMap[ correctPositions[i] ] = i ; 
    }
    
    var posOffset = []; 
    
    for(var i = 0; i < 4; i++){ 
      var correctIndex = i; 
      var actualIndex = correctIndexMap[pos[i]] ; 
      posOffset.push( (actualIndex - correctIndex + 4)%4 ) 
    }
   
    /****
      posOffset is the number of positions I have to go back to get to
      the correct position (go-back maps to a move 'b')
    ****/
  
    var offsetMap = {
      "0000" : null, 
      
      "0112" : [ 1, 1, 2 ],  
      "2011" : [ 2, 1, 1 ], 
      "1201" : [ 3, 1, 0 ], 
      "1120" : [ 0, 1, 3 ], 
    
      "1313" : [ 0, 2, 2 ], 
      "3131" : [ 1, 2, 1 ] 
    }
    
    //console.log(posOffset.join('')); 
    
    for(var i = 0; i < 4; i++){ 
      if(posOffset.join('') in offsetMap)
        break; 
      
      this.makeMoves('b');
      //console.log('move b'); 
      
      for(var j = 0; j < 4; j++){ 
        posOffset[j] = (posOffset[j] + 3) % 4 ;  
      }
    }
    
    //sanity check!
    if(!(posOffset.join('') in offsetMap)){ 
      console.log('new offsetMap found!'); 
      console.log(posOffset); 
    }
    
    //for debugging!
    //console.log(posOffset.join('')); 
    
    var posOffsetJoin = posOffset.join('') ; 
    
    if( posOffsetJoin != '0000' ){ 
      
      var x = offsetMap[ posOffsetJoin ] ; 
      var a = x[0]; 
      var b = x[1]; 
      var c = x[2];
      
      var m0 = 'lRfBlFbuuLr'; 
      var m1 = this.reverse(m0); 
    
      for(var i = 0; i < a; i++){ 
        this.makeMoves('b');  
      }
      
      this.makeMoves(m0);  
      
      for(var i = 0; i < b; i++){ 
        this.makeMoves('b');  
      }

      this.makeMoves(m1);  
      
      for(var i = 0; i < c; i++){ 
        this.makeMoves('b');  
      }
    }
  }, 
  
/******
At last ... corners ... first step
re-orient corners
******/
  function(){
    
    var qb = [ '135', '125', '124', '134' ]; 

    var pos = []; 
    for(var i = 0; i < qb.length; i++){ 
      pos.push( this.find(qb[i]) );  
    }

    var posStr = pos.join('_'); 

    var positionsTable = [
      [ 'BUL', 'ULB', 'LBU', 'BLU', 'UBL', 'LUB' ], 
      [ 'BDL', 'LBD', 'DLB', 'BLD', 'LDB', 'DBL' ], 
      [ 'BDR', 'DRB', 'RBD', 'BRD', 'DBR', 'RDB' ], 
      [ 'BUR', 'RBU', 'URB', 'BRU', 'RUB', 'UBR' ] 
    ]
    
    //console.log(posStr); 
    
    var cMap = []; 
    for(var i = 0; i < 4; i++){ 
      for(var j = 0; j < 6; j++){ 
        if(posStr.includes(positionsTable[i][j])){ 
          cMap.push(j%3);  
        }
      }
    }
    
    //console.log(cMap.join('')); 
    
    m2 = 'uFULFl' ; 
    m1 = this.reverse(m2); 
    
    var count = 0; //for safety!!!
    
    while(cMap.join('') != '0000'){ 
      var i = 0; 
      while(cMap[i] == 0)
        i++; 
      
      var j = i+1; 
      while(cMap[j] == 0)
        j++; 
      
      for(var k = 0; k < i; k++){ 
        this.makeMoves('b');   
      }
      
      var parity = cMap[i]; 
      
      this.makeMoves( parity == 1 ? m1 : m2 ); 
      
      for(var k = 0; k < j-i; k++){ 
        this.makeMoves('b');   
      }
      
      this.makeMoves( parity == 1 ? m2 : m1 );
      
      for(var k = 0; k < j; k++){ 
        this.makeMoves('B');   
      }

      cMap[i] = ( cMap[i] + ((parity == 1) ? 2 : 1) ) % 3 ;  
      cMap[j] = ( cMap[j] + ((parity == 1) ? 1 : 2) ) % 3 ; 
      
      //console.log(cMap.join('')); 
      
      //console.log('i = ' + i + ' j = ' + j ) ; 
      
      count++; 
      if(count > 4)
        break; 
      
    }

  }, 
  
/**
  last step - row3, re-position corners
**/
  function (){ 
     
    var qb = [ '135', '125', '124', '134' ]; 

    var pos = []; 
    for(var i = 0; i < qb.length; i++){ 
      pos.push( this.find(qb[i]) );  
    }        

    //console.log(pos.join('_'));  
    
    var correctIndexMap = { 'BUL' : 0, 'BLU' : 0, 
                            'BDL' : 1, 'BLD' : 1, 
                            'BDR' : 2, 'BRD' : 2,
                            'BUR' : 3, 'BRU' : 3
    } 
    
    var posOffset = []; 
    
    for(var i = 0; i < 4; i++){ 
      var correctIndex = i; 
      var actualIndex = correctIndexMap[pos[i]] ; 
      posOffset.push( (actualIndex - correctIndex + 4)%4 ) 
    }
    
    //console.log(posOffset.join('_')); 
    
    var offsetMap = {
      "0000" : null, 
      "2222" : null, 
      
               //todo: check offsets
      "0112" : [ 2, 1, 1 ],  
      "2011" : [ 3, 1, 0 ], 
      "1201" : [ 0, 1, 3 ], 
      "1120" : [ 1, 1, 2 ], 

      "0233" : [ 3, 3, 2 ],  
      "3023" : [ 0, 3, 1 ], 
      "3302" : [ 1, 3, 0 ], 
      "2330" : [ 2, 3, 3 ], 

      "1313" : [ 1, 2, 1 ], 
      "3131" : [ 0, 2, 2 ] 
    }

    if(cubeSize == 2) {
      for(var i = 0; i < 4; i++){ 
        if(posOffset.join('') in offsetMap)
          break; 
      
        this.makeMoves('b');
       
        for(var j = 0; j < 4; j++){ 
          posOffset[j] = (posOffset[j] + 3) % 4 ;  
        }
      }
    }

    //sanity check!
    if(!(posOffset.join('') in offsetMap)){ 
      console.log('new offsetMap found!'); 
      console.log(posOffset); 
    }

    var posOffsetJoin = posOffset.join('') ; 
    
    var m0 = 'rfRfuFUFFUfu'; 
    var m1 = this.reverse(m0); 
    
    //TODO: 2222 is a special case!
    if( posOffsetJoin != '0000' && posOffsetJoin != '2222' ){ 
      
      var x = offsetMap[ posOffsetJoin ] ; 
      var a = x[0]; 
      var b = x[1]; 
      var c = x[2];

      for(var i = 0; i < a; i++){ 
        this.makeMoves('b');  
      }
      
      this.makeMoves(m0);  
      
      for(var i = 0; i < b; i++){ 
        this.makeMoves('b');  
      }

      this.makeMoves(m1);  
      
      for(var i = 0; i < c; i++){ 
        this.makeMoves('b');  
      }

    }
    
    if( posOffsetJoin == '2222' ){ 
      this.makeMoves(m0);  
      this.makeMoves('bb');  
      this.makeMoves(m1);  
      this.makeMoves('b');  
      this.makeMoves(m0);  
      this.makeMoves('bb');  
      this.makeMoves(m1);  
      this.makeMoves('B');  
    }

  }
  
];

//returns the character m with opposite case
Solver.prototype.flip = function(m){ 

  if(m.toLowerCase() == m) 
    return m.toUpperCase();  
  else
    return m.toLowerCase(); 

}
  
  
//returns the reverse of the sequence:
Solver.prototype.reverse = function(m){ 
  //TODO:
  var result = '' ; 
  
  while(m.length > 0){ 
    var move = m.charAt(0); 
    m = m.substring(1); 
    
    move = this.flip(move); 
    
    if(isDigit(m.charAt(0))) { 
      move += m.charAt(0); 
      m = m.substring(1); 
    }
    
    result = move + result;  
  }
 
  return result ; 
}


Solver.prototype.turn = function(m, turns){
  var map = { 
    "d" : "l", 
    "D" : "L", 
    "l" : "u", 
    "L" : "U", 
    "u" : "r", 
    "U" : "R", 
    "r" : "d", 
    "R" : "D", 
    "f" : "f", 
    "F" : "F", 
    "b" : "b", 
    "B" : "B" 
  }
  
  var result = m ; 
  
  for(var t = 0; t < turns; t++){ 
    result = '' ; 
  
    for(var i = 0; i < m.length; i++){ 
      result += map[m.charAt(i)] ;  
    }
    
    m = result ; 
  }
  
  return result ; 
}


//return the correct position of the provided qb
Solver.prototype.correctPos = function(qb){ 
  var result = '' ; 
  
  var f = qb.split(''); 
  for(var i = 0; i < f.length; i++){ 
    result += faceList[f[i]-0]; 
  }
  
  return result ; 
}

Solver.prototype.row1_corner_step1 = function(qb){
    var pos = this.find(qb);  
    
    var turns = 0; 
    if(pos != this.correctPos(qb) && pos.includes('F')){ 
      if(pos.includes('D') && pos.includes('L'))
        turns = 0; 
      else if(pos.includes('U') && pos.includes('L'))
        turns = 1;
      else if(pos.includes('U') && pos.includes('R'))
        turns = 2;
      else if(pos.includes('D') && pos.includes('R'))
        turns = 3;

      for(var i = 0; i < turns; i++){ 
        this.makeMoves('f');   
      }
    
      this.makeMoves('dbD'); 
    
      for(var i = 0; i < turns; i++){ 
        this.makeMoves('F');   
      }
    }
}

Solver.prototype.row1_corner_step2 = function(qb){ 
    var pos = this.find(qb);  
    
    if(pos != this.correctPos(qb)) { 
      if(pos.includes('U') && pos.includes('L'))
        this.makeMoves('B'); 
      else if(pos.includes('U') && pos.includes('R'))
        this.makeMoves('BB');
      else if(pos.includes('D') && pos.includes('R'))
        this.makeMoves('b');
    }
}

Solver.prototype.row1_corner_step3 = function(qb){ 
    var pos = this.find(qb);  
    
    //TODO: turn front face so correct position is on FDL corner
    var turns = {'025' : 0, '035' : 1, '034' : 2, '024' : 3}[qb];
  
        
    if(pos != this.correctPos(qb)) {
      
      for(var i = 0; i < turns; i++){ 
        this.makeMoves('f'); 
      }
      
      var c = pos.charAt(0); 
      if(c == 'B')
        this.makeMoves('bdbbDbdBD');
      else if(c == 'D')
        this.makeMoves('BLbl');
      else if(c == 'L')
        this.makeMoves('bdBD');
    
      for(var i = 0; i < turns; i++){ 
        this.makeMoves('F'); 
      }
    }  
}

Solver.prototype.row2_edge_step1 = function(qb){ 
  if(cubeSize == 2)
    return; 

  var pos = this.find(qb); 
    
  if(pos != this.correctPos(qb) && !pos.includes('B') ) {
    var turns = 0; 
    if(pos.includes('D') && pos.includes('L'))
      turns = 0; 
    else if(pos.includes('U') && pos.includes('L'))
      turns = 1;
    else if(pos.includes('U') && pos.includes('R'))
      turns = 2;
    else if(pos.includes('D') && pos.includes('R'))
      turns = 3;
  
    //turn the cube! then make the move
     
    this.makeMoves(this.turn('dBDBLbl', turns)); 
  }
}

Solver.prototype.row2_edge_step2 = function(qb){ 
  if(cubeSize == 2)
    return; 

//    var qb = '25';     //orange-blue
  
    var turns = {'25':0, '35':1, '34':2, '24':3 }[qb]; 
  
    var parity = {'25':0, '35':1, '34':0, '24':1 }[qb];
  
    var pos = this.find(qb); 
    
    if(pos != this.correctPos(qb)){
      
      var x = { 
        "BL" : [ 1, 0 ],   
        "BU" : [ 0, 0 ],   
        "BR" : [ 3, 0 ],   
        "BD" : [ 2, 0 ],   

        "LB" : [ 2, 1 ],   
        "UB" : [ 1, 1 ],   
        "RB" : [ 0, 1 ],   
        "DB" : [ 3, 1 ]   
        
      }[pos]; 
             
      var seq = ['dBDBLbl', 'LblbdBD']; 
      
      var t = (x[0] + turns )%4 ; 
      
      if(x[1] == 0)
        t = (t + parity) % 4; 
      else
        t = (t + 4-parity) % 4; 
      
      for(var i = 0; i < t; i++){ 
        this.makeMoves('b');  
      }
      
      this.makeMoves(this.turn(seq[(x[1]+parity)%2], turns) ); 
      
    }
}

//end the sequence of steps
//useful for debugging
Solver.prototype.end = function(){ 
  this.stepCount = this.actionSteps.length - 1; 
}

Solver.prototype.step = function(){ 

  if(this.stepCount < this.actionSteps.length){ 
    this.actionSteps[this.stepCount].apply(this); 
    this.stepCount++; 
  }
  else
  {
    this.solving = false; 
  }
 
}

Solver.prototype.makeMoves = function(moves){ 
  while(moves.length > 0){ 
    var move = moves.charAt(0);
    moves = moves.substring(1);  
    
    if(isDigit(moves.charAt(0))){ 
      move += moves.charAt(0); 
      moves = moves.substring(1); 
    }
    
    makeMove(move); 
  } 
}

function isDigit(k){ 
  return !isNaN(parseInt(k)); 
}
