var ENGINE = {
	SYMBOLS:{
		"ARGUMENT_PREFIX":1,
		"ELT":2,
		"ELTCLASS":3,
		"ELTID":4,
		"EQUAL":5,
		"GTHAN":6,
		"LBRACK":7,
		"LPAREN":8,
		"MULTIPLICATION":9,
		"NUMBER":10,
		"PLUS":11,
		"RBRACK":12,
		"RPAREN":13,
		"STRING":14,
		"UP":15,
		"ZEN":16,
		"INSTRUCTION":17,
		"REPEAT":18,
		"GROUPING":19,
		"DEFINITION":20,
		"ARGS":21,
		"ATTRS":22,
		"ATTR":23,
		"CATTRS":24,
		"CATTR":25,
		"VALUE":26
		},
	PRODUCTIONS:{
		1:["ZEN",["INSTRUCTION"]],
		2:["ZEN",["REPEAT"]],
		3:["INSTRUCTION",["REPEAT","GTHAN","ZEN"]],
		4:["INSTRUCTION",["REPEAT","PLUS","ZEN"]],
		5:["INSTRUCTION",["REPEAT","UP","ZEN"]],
		6:["REPEAT",["GROUPING","MULTIPLICATION"]],
		7:["REPEAT",["GROUPING"]],
		8:["GROUPING",["ELT"]],
		9:["GROUPING",["ELT","DEFINITION"]],
		10:["GROUPING",["ELT","DEFINITION","STRING"]],
		11:["GROUPING",["ELT","STRING"]],
		12:["GROUPING",["STRING"]],
		13:["GROUPING",["LPAREN","RPAREN"]],
		14:["GROUPING",["LPAREN","ZEN","RPAREN"]],
		15:["DEFINITION",["ARGS","ATTRS"]],
		16:["DEFINITION",["ARGS"]],
		17:["DEFINITION",["ATTRS"]],
		18:["DEFINITION",["ATTRS","ARGS"]],
		19:["ARGS",["ARGS","ARGUMENT_PREFIX","VALUE"]],
		20:["ARGS",["ARGUMENT_PREFIX","VALUE"]],
		21:["ATTRS",["ATTRS","ATTR"]],
		22:["ATTRS",["ATTR"]],
		23:["ATTR",["ELTID"]],
		24:["ATTR",["ELTCLASS"]],
		25:["ATTR",["LBRACK","CATTRS","RBRACK"]],
		26:["CATTRS",["CATTRS","CATTR"]],
		27:["CATTRS",["CATTR"]],
		28:["CATTR",["ELT","EQUAL","VALUE"]],
		29:["CATTR",["ELT"]],
		30:["VALUE",["ELT"]],
		31:["VALUE",["STRING"]],
		32:["VALUE",["NUMBER"]]
		},
	MATRICE:{
		1:[,,'s6',,,,,,'s8',,,,,,'s7',,'g2','g3','g4','g5'],
		2:['a'],
		3:['r1',,,,,,,,,,,,,'r1'],
		4:['r2',,,,,,'s9',,,,,'s10',,'r2',,'s11'],
		5:['r7',,,,,,'r7',,,'s12',,'r7',,'r7',,'r7'],
		6:['r8','s17',,'s20','s19',,'r8','s21',,'r8',,'r8',,'r8','s14','r8',,,,,'g13','g15','g16','g18'],
		7:['r12',,,,,,'r12',,,'r12',,'r12',,'r12',,'r12'],
		8:[,,'s6',,,,,,'s8',,,,,'s22','s7',,'g23','g3','g4','g5'],
		9:[,,'s6',,,,,,'s8',,,,,,'s7',,'g24','g3','g4','g5'],
		10:[,,'s6',,,,,,'s8',,,,,,'s7',,'g25','g3','g4','g5'],
		11:[,,'s6',,,,,,'s8',,,,,,'s7',,'g26','g3','g4','g5'],
		12:['r6',,,,,,'r6',,,,,'r6',,'r6',,'r6'],
		13:['r9',,,,,,'r9',,,'r9',,'r9',,'r9','s27','r9'],
		14:['r11',,,,,,'r11',,,'r11',,'r11',,'r11',,'r11'],
		15:['r16','s29',,'s20','s19',,'r16','s21',,'r16',,'r16',,'r16','r16','r16',,,,,,,'g28','g18'],
		16:['r17','s17',,'s20','s19',,'r17','s21',,'r17',,'r17',,'r17','r17','r17',,,,,,'g30',,'g31'],
		17:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,'g32'],
		18:['r22','r22',,'r22','r22',,'r22','r22',,'r22',,'r22',,'r22','r22','r22'],
		19:['r23','r23',,'r23','r23',,'r23','r23',,'r23',,'r23',,'r23','r23','r23'],
		20:['r24','r24',,'r24','r24',,'r24','r24',,'r24',,'r24',,'r24','r24','r24'],
		21:[,,'s38',,,,,,,,,,,,,,,,,,,,,,'g36','g37'],
		22:['r13',,,,,,'r13',,,'r13',,'r13',,'r13',,'r13'],
		23:[,,,,,,,,,,,,,'s39'],
		24:['r3',,,,,,,,,,,,,'r3'],
		25:['r4',,,,,,,,,,,,,'r4'],
		26:['r5',,,,,,,,,,,,,'r5'],
		27:['r10',,,,,,'r10',,,'r10',,'r10',,'r10',,'r10'],
		28:['r15',,,'s20','s19',,'r15','s21',,'r15',,'r15',,'r15','r15','r15',,,,,,,,'g31'],
		29:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,'g40'],
		30:['r18','s29',,,,,'r18',,,'r18',,'r18',,'r18','r18','r18'],
		31:['r21','r21',,'r21','r21',,'r21','r21',,'r21',,'r21',,'r21','r21','r21'],
		32:['r20','r20',,'r20','r20',,'r20','r20',,'r20',,'r20',,'r20','r20','r20'],
		33:['r30','r30','r30','r30','r30',,'r30','r30',,'r30',,'r30','r30','r30','r30','r30'],
		34:['r31','r31','r31','r31','r31',,'r31','r31',,'r31',,'r31','r31','r31','r31','r31'],
		35:['r32','r32','r32','r32','r32',,'r32','r32',,'r32',,'r32','r32','r32','r32','r32'],
		36:[,,'s38',,,,,,,,,,'s41',,,,,,,,,,,,,'g42'],
		37:[,,'r27',,,,,,,,,,'r27'],
		38:[,,'r29',,,'s43',,,,,,,'r29'],
		39:['r14',,,,,,'r14',,,'r14',,'r14',,'r14',,'r14'],
		40:['r19','r19',,'r19','r19',,'r19','r19',,'r19',,'r19',,'r19','r19','r19'],
		41:['r25','r25',,'r25','r25',,'r25','r25',,'r25',,'r25',,'r25','r25','r25'],
		42:[,,'r26',,,,,,,,,,'r26'],
		43:[,,'s33',,,,,,,,'s35',,,,'s34',,,,,,,,,,,,'g44'],
		44:[,,'r28',,,,,,,,,,'r28']
		},
	AST:function( sProd, LHS, RHS ){
		var f =function ( esuParent, aeChild ){
			var e = ! esuParent
				? document.createDocumentFragment()
				:( esuParent.appendChild ? esuParent : document.createElement( esuParent ) 
				)
			if( ! e.className ) e.className = 'myNode' + ( ! esuParent || esuParent.appendChild ? '' : ' '+ esuParent.toLowerCase())
			if( ! e.title ) e.title = e.nodeName
			if( aeChild.constructor==Array ){
				for(var i=0, ni=aeChild.length; i<ni; i++ )
					if( aeChild[i]) e.appendChild( aeChild[i])
				}
			else e.appendChild( aeChild )
			return e
			}
		var g =function( eParent ){
			eParent.firstChild.oValue.value = ''
			return eParent.childNodes.length == 3
				? eParent.firstChild.nextSibling
				: eParent.firstChild
			}
		switch( sProd ){
			case "(0) ZEN' -> ZEN END_TOKENS":
			case "(1) ZEN -> INSTRUCTION":
			case "(2) ZEN -> REPEAT":
				return RHS[0].nodeType!=11 
					? f( document.createDocumentFragment(), RHS[0])
					: RHS[0]
			case "(3) INSTRUCTION -> REPEAT GTHAN ZEN":
				if( RHS[0].nodeName!='MULTIPLICATION') return f( RHS[0], RHS[2])
				f( RHS[0].lastChild, RHS[2])
				return RHS[0]
			case "(4) INSTRUCTION -> REPEAT PLUS ZEN": return f( null, [RHS[0],RHS[2]])
			case "(5) INSTRUCTION -> REPEAT UP ZEN": return f( null, RHS )
			case "(6) REPEAT -> GROUPING MULTIPLICATION": return f( RHS[1], RHS[0])
			case "(7) REPEAT -> GROUPING": return RHS[0];
			case "(8) GROUPING -> ELT": return RHS[0];
			case "(9) GROUPING -> ELT DEFINITION": return f( RHS[0], RHS[1])
			case "(10) GROUPING -> ELT DEFINITION STRING": return f( RHS[0], [ RHS[1], g( RHS[2]) ])
			case "(11) GROUPING -> ELT STRING": return f( RHS[0], g( RHS[1]) )
			case "(12) GROUPING -> STRING": return g( RHS[0])
			case "(13) GROUPING -> LPAREN RPAREN": return null
			case "(14) GROUPING -> LPAREN ZEN RPAREN": return RHS[1]
			case "(15) DEFINITION -> ARGS ATTRS": return f( null, [ f('ARGUMENTS',RHS[0]), f('ATTRIBUTES',RHS[1])])
			case "(16) DEFINITION -> ARGS": return f('ARGUMENTS', RHS[0])
			case "(17) DEFINITION -> ATTRS": return f('ATTRIBUTES', RHS[0])
			case "(18) DEFINITION -> ATTRS ARGS": return f( null, [ f('ARGUMENTS',RHS[1]), f('ATTRIBUTES',RHS[0])])
			case "(19) ARGS -> ARGS ARGUMENT_PREFIX VALUE": return f( null, [RHS[0],RHS[2]])
			case "(20) ARGS -> ARGUMENT_PREFIX VALUE": return RHS[1]
			case "(21) ATTRS -> ATTRS ATTR": return f( null, RHS )
			case "(22) ATTRS -> ATTR":
			case "(23) ATTR -> ELTID":
			case "(24) ATTR -> ELTCLASS": return RHS[0];
			case "(25) ATTR -> LBRACK CATTRS RBRACK": return RHS[1]
			case "(26) CATTRS -> CATTRS CATTR": return f( null, RHS )
			case "(27) CATTRS -> CATTR": return RHS[0];
			case "(28) CATTR -> ELT EQUAL VALUE": return f( RHS[0], RHS[2])
			case "(29) CATTR -> ELT": return RHS[0];
			case "(30) VALUE -> ELT": return RHS[0];
			case "(31) VALUE -> STRING": return g( RHS[0])
			case "(32) VALUE -> NUMBER": return RHS[0];
			}
		}
	}