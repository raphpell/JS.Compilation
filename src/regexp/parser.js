var RegExpParser ={
	REGEXP:{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"CHAR":1,
				"CHARSET":2,
				"CHAR_ESCAPED":3,
				"DOT":4,
				"MINUS":5,
				"NEGATED_CHARSET":6,
				"PIPE":7,
				"PLUS":8,
				"QUANTIFIER":9,
				"QUESTION":10,
				"STAR":11,
				"SUB_REGEXP":12,
				"REGEXP":13,
				"UNION":14,
				"CONCAT":15,
				"REPEAT":16,
				"QUANTIFIERS":17,
				"CHAR_CLASS_EXP":18,
				"SIMPLE_EXP":19,
				"END_TOKENS":20
				},
		PRODUCTIONS:{
				1:["REGEXP",["UNION"]],
				2:["REGEXP",["&epsilon;"]],
				3:["UNION",["CONCAT","PIPE","UNION"]],
				4:["UNION",["CONCAT"]],
				5:["CONCAT",["REPEAT","CONCAT"]],
				6:["CONCAT",["REPEAT"]],
				7:["REPEAT",["REPEAT","QUANTIFIERS"]],
				8:["REPEAT",["CHAR_CLASS_EXP"]],
				9:["QUANTIFIERS",["QUESTION"]],
				10:["QUANTIFIERS",["STAR"]],
				11:["QUANTIFIERS",["PLUS"]],
				12:["QUANTIFIERS",["QUANTIFIER"]],
				13:["CHAR_CLASS_EXP",["CHARSET"]],
				14:["CHAR_CLASS_EXP",["NEGATED_CHARSET"]],
				15:["CHAR_CLASS_EXP",["SIMPLE_EXP"]],
				16:["SIMPLE_EXP",["CHAR"]],
				17:["SIMPLE_EXP",["CHAR_ESCAPED"]],
				18:["SIMPLE_EXP",["DOT"]],
				19:["SIMPLE_EXP",["SUB_REGEXP"]],
				20:["SIMPLE_EXP",["MINUS"]]
				},
		MATRICE:{
				1:[,'s10','s7','s11','s12','s14','s8',,,,,,'s13','g2','g3','g4','g5',,'g6','g9','r2'],
				2:[,,,,,,,,,,,,,,,,,,,,'a'],
				3:[,,,,,,,,,,,,,,,,,,,,'r1'],
				4:[,,,,,,,'s15',,,,,,,,,,,,,'r4'],
				5:[,'s10','s7','s11','s12','s14','s8','r6','s20','s21','s18','s19','s13',,,'g16','g5','g17','g6','g9','r6'],
				6:[,'r8','r8','r8','r8','r8','r8','r8','r8','r8','r8','r8','r8',,,,,,,,'r8'],
				7:[,'r13','r13','r13','r13','r13','r13','r13','r13','r13','r13','r13','r13',,,,,,,,'r13'],
				8:[,'r14','r14','r14','r14','r14','r14','r14','r14','r14','r14','r14','r14',,,,,,,,'r14'],
				9:[,'r15','r15','r15','r15','r15','r15','r15','r15','r15','r15','r15','r15',,,,,,,,'r15'],
				10:[,'r16','r16','r16','r16','r16','r16','r16','r16','r16','r16','r16','r16',,,,,,,,'r16'],
				11:[,'r17','r17','r17','r17','r17','r17','r17','r17','r17','r17','r17','r17',,,,,,,,'r17'],
				12:[,'r18','r18','r18','r18','r18','r18','r18','r18','r18','r18','r18','r18',,,,,,,,'r18'],
				13:[,'r19','r19','r19','r19','r19','r19','r19','r19','r19','r19','r19','r19',,,,,,,,'r19'],
				14:[,'r20','r20','r20','r20','r20','r20','r20','r20','r20','r20','r20','r20',,,,,,,,'r20'],
				15:[,'s10','s7','s11','s12','s14','s8',,,,,,'s13',,'g22','g4','g5',,'g6','g9'],
				16:[,,,,,,,'r5',,,,,,,,,,,,,'r5'],
				17:[,'r7','r7','r7','r7','r7','r7','r7','r7','r7','r7','r7','r7',,,,,,,,'r7'],
				18:[,'r9','r9','r9','r9','r9','r9','r9','r9','r9','r9','r9','r9',,,,,,,,'r9'],
				19:[,'r10','r10','r10','r10','r10','r10','r10','r10','r10','r10','r10','r10',,,,,,,,'r10'],
				20:[,'r11','r11','r11','r11','r11','r11','r11','r11','r11','r11','r11','r11',,,,,,,,'r11'],
				21:[,'r12','r12','r12','r12','r12','r12','r12','r12','r12','r12','r12','r12',,,,,,,,'r12'],
				22:[,,,,,,,,,,,,,,,,,,,,'r3']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) REGEXP' -> REGEXP END_TOKENS": return RHS[0];
				case "(1) REGEXP -> UNION": return RHS[0];
				case "(2) REGEXP -> &epsilon;": return false;
				case "(3) UNION -> CONCAT PIPE UNION":
					if( RHS[0] && RHS[2] ){
						o = LexerNode({token:'PIPE',css:'alternation'})
						var addPipeChild =function( eChild ){
							if( eChild.nodeName=='PIPE' ){
								for(var e=eChild.firstChild; e ;  ){
									var oNode = e
									e=e.nextSibling
									o.appendChild( oNode )
									}
								} else o.appendChild( eChild )
							}
						addPipeChild( RHS[0])
						addPipeChild( RHS[2])
						return o
						}
					return RHS[0] || RHS[2]
				case "(4) UNION -> CONCAT": return RHS[0];
				case "(5) CONCAT -> REPEAT CONCAT":
					if( RHS[0] && RHS[1] ){
						o = LexerNode({token:'CONCAT',css:'concat'})
						o.appendChild( RHS[0])
						if( RHS[1].nodeName=='CONCAT' ){
							for(var e=RHS[1].firstChild; e ;  ){
								var oNode = e
								e=e.nextSibling
								o.appendChild( oNode )
								}
							} else o.appendChild( RHS[1])
						return o
						}
					return RHS[0] || RHS[1]
				case "(6) CONCAT -> REPEAT": return RHS[0];
				case "(7) REPEAT -> REPEAT QUANTIFIERS":
					o = RHS[1]
					o.appendChild( RHS[0])
					return o
				case "(8) REPEAT -> CHAR_CLASS_EXP":
					return RHS[0];
				case "(9) QUANTIFIERS -> QUESTION":
					return LexerNode({
						token:'QUANTIFIER'
						,css:'quantifier'
						,n:'0'
						,m:'1'
					//	,value: '0,1'
						})
				case "(10) QUANTIFIERS -> STAR":
					return LexerNode({
						token:'QUANTIFIER'
						,css:'quantifier'
						,n:'0'
						,m:'\u221E'
					//	,value: '0,\u221E'
						})
				case "(11) QUANTIFIERS -> PLUS":
					return LexerNode({
						token:'QUANTIFIER'
						,css:'quantifier'
						,n:'1'
						,m:'\u221E'
					//	,value: '1,\u221E'
						})
				case "(12) QUANTIFIERS -> QUANTIFIER":
					if( RHS[0].firstChild.nodeName=='LBRACE' ) RHS[0].removeChild( RHS[0].firstChild )
					if( RHS[0].lastChild.nodeName=='RBRACE' ) RHS[0].removeChild( RHS[0].lastChild )
					var aTokens = to_array( RHS[0].childNodes )
					return ParserLR( aTokens, RegExpParser.QUANTIFIER )
				case "(13) CHAR_CLASS_EXP -> CHARSET":
					o = LexerNode({token:'CHARCLASS',css:'charclass'})
					if( RHS[0].firstChild.nodeName=='LBRACK' ) RHS[0].removeChild( RHS[0].firstChild )
					if( RHS[0].lastChild.nodeName=='RBRACK' ) RHS[0].removeChild( RHS[0].lastChild )
					var aTokens = to_array( RHS[0].childNodes )
					o.appendChild( ParserLR( aTokens, RegExpParser.CHARCLASS ))
					return o
				case "(14) CHAR_CLASS_EXP -> NEGATED_CHARSET":
					o = LexerNode({token:'NEGATED_CHARCLASS',css:'charclass negated'})
					if( RHS[0].firstChild.nodeName=='NLBRACK' ) RHS[0].removeChild( RHS[0].firstChild )
					if( RHS[0].lastChild.nodeName=='NRBRACK' ) RHS[0].removeChild( RHS[0].lastChild )
					var aTokens = to_array( RHS[0].childNodes )
					o.appendChild( ParserLR( aTokens, RegExpParser.CHARCLASS ))
					return o
				case "(15) CHAR_CLASS_EXP -> SIMPLE_EXP":
					return RHS[0];
				case "(16) SIMPLE_EXP -> CHAR":
				case "(17) SIMPLE_EXP -> CHAR_ESCAPED":
				case "(18) SIMPLE_EXP -> DOT":
					return RHS[0];
				case "(19) SIMPLE_EXP -> SUB_REGEXP":
					if( RHS[0].firstChild.nodeName=='LPAREN' ) RHS[0].removeChild( RHS[0].firstChild )
					if( RHS[0].lastChild.nodeName=='RPAREN' ) RHS[0].removeChild( RHS[0].lastChild )
					var aTokens = to_array( RHS[0].childNodes )
					return ParserLR( aTokens, RegExpParser.REGEXP )
				case "(20) SIMPLE_EXP -> MINUS":
					return RHS[0];
				}
			}
		},
	CHARCLASS :{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"CHAR":1,
				"CHAR_ESCAPED":2,
				"DOT":3,
				"LBRACE":4,
				"LBRACK":5,
				"LPAREN":6,
				"MINUS":7,
				"PIPE":8,
				"PLUS":9,
				"QUESTION":10,
				"RBRACE":11,
				"RPAREN":12,
				"STAR":13,
				"CHAR_CLASSES":14,
				"CHAR_CLASS":15,
				"SIMPLE_CHAR":16,
				"END_TOKENS":17
				},
		PRODUCTIONS:{
				1:["CHAR_CLASSES",["CHAR_CLASS","CHAR_CLASSES"]],
				2:["CHAR_CLASSES",["CHAR_CLASS"]],
				3:["CHAR_CLASS",["SIMPLE_CHAR","MINUS","SIMPLE_CHAR"]],
				4:["CHAR_CLASS",["SIMPLE_CHAR"]],
				5:["SIMPLE_CHAR",["CHAR"]],
				6:["SIMPLE_CHAR",["CHAR_ESCAPED"]],
				7:["SIMPLE_CHAR",["LBRACK"]],
				8:["SIMPLE_CHAR",["DOT"]],
				9:["SIMPLE_CHAR",["PIPE"]],
				10:["SIMPLE_CHAR",["LPAREN"]],
				11:["SIMPLE_CHAR",["RPAREN"]],
				12:["SIMPLE_CHAR",["STAR"]],
				13:["SIMPLE_CHAR",["PLUS"]],
				14:["SIMPLE_CHAR",["QUESTION"]],
				15:["SIMPLE_CHAR",["LBRACE"]],
				16:["SIMPLE_CHAR",["RBRACE"]]
				},
		MATRICE:{
				1:[,'s5','s6','s8','s15','s7','s10',,'s9','s13','s14','s16','s11','s12','g2','g3','g4'],
				2:[,,,,,,,,,,,,,,,,,'a'],
				3:[,'s5','s6','s8','s15','s7','s10',,'s9','s13','s14','s16','s11','s12','g17','g3','g4','r2'],
				4:[,'r4','r4','r4','r4','r4','r4','s18','r4','r4','r4','r4','r4','r4',,,,'r4'],
				5:[,'r5','r5','r5','r5','r5','r5','r5','r5','r5','r5','r5','r5','r5',,,,'r5'],
				6:[,'r6','r6','r6','r6','r6','r6','r6','r6','r6','r6','r6','r6','r6',,,,'r6'],
				7:[,'r7','r7','r7','r7','r7','r7','r7','r7','r7','r7','r7','r7','r7',,,,'r7'],
				8:[,'r8','r8','r8','r8','r8','r8','r8','r8','r8','r8','r8','r8','r8',,,,'r8'],
				9:[,'r9','r9','r9','r9','r9','r9','r9','r9','r9','r9','r9','r9','r9',,,,'r9'],
				10:[,'r10','r10','r10','r10','r10','r10','r10','r10','r10','r10','r10','r10','r10',,,,'r10'],
				11:[,'r11','r11','r11','r11','r11','r11','r11','r11','r11','r11','r11','r11','r11',,,,'r11'],
				12:[,'r12','r12','r12','r12','r12','r12','r12','r12','r12','r12','r12','r12','r12',,,,'r12'],
				13:[,'r13','r13','r13','r13','r13','r13','r13','r13','r13','r13','r13','r13','r13',,,,'r13'],
				14:[,'r14','r14','r14','r14','r14','r14','r14','r14','r14','r14','r14','r14','r14',,,,'r14'],
				15:[,'r15','r15','r15','r15','r15','r15','r15','r15','r15','r15','r15','r15','r15',,,,'r15'],
				16:[,'r16','r16','r16','r16','r16','r16','r16','r16','r16','r16','r16','r16','r16',,,,'r16'],
				17:[,,,,,,,,,,,,,,,,,'r1'],
				18:[,'s5','s6','s8','s15','s7','s10',,'s9','s13','s14','s16','s11','s12',,,'g19'],
				19:[,'r3','r3','r3','r3','r3','r3',,'r3','r3','r3','r3','r3','r3',,,,'r3']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) CHAR_CLASSES' -> CHAR_CLASSES END_TOKENS": return RHS[0];
				case "(1) CHAR_CLASSES -> CHAR_CLASS CHAR_CLASSES":
					o = document.createDocumentFragment ()
					o.appendChild( RHS[0])
					o.appendChild( RHS[1])
					return o
				case "(2) CHAR_CLASSES -> CHAR_CLASS": return RHS[0];
				case "(3) CHAR_CLASS -> SIMPLE_CHAR MINUS SIMPLE_CHAR":
					o = LexerNode({token:'RANGE',css:'characters_range'})
					o.appendChild( RHS[0])
					o.appendChild( RHS[2])
					return o
				case "(4) CHAR_CLASS -> SIMPLE_CHAR":
				case "(5) SIMPLE_CHAR -> CHAR":
				case "(6) SIMPLE_CHAR -> CHAR_ESCAPED":
				case "(7) SIMPLE_CHAR -> LBRACK":
				case "(8) SIMPLE_CHAR -> DOT":
				case "(9) SIMPLE_CHAR -> PIPE":
				case "(10) SIMPLE_CHAR -> LPAREN":
				case "(11) SIMPLE_CHAR -> RPAREN":
				case "(12) SIMPLE_CHAR -> STAR":
				case "(13) SIMPLE_CHAR -> PLUS":
				case "(14) SIMPLE_CHAR -> QUESTION":
				case "(15) SIMPLE_CHAR -> LBRACE":
				case "(16) SIMPLE_CHAR -> RBRACE":
					o = RHS[0].oValue
					o.token = 'CHAR'
					o.css = 'character'
					return LexerNode(o)
				}
			}
		},
	QUANTIFIER :{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"ELISION":1,
				"INTEGER":2,
				"QUANTIFIER":3,
				"END_TOKENS":4
				},
		PRODUCTIONS:{
				1:["QUANTIFIER",["INTEGER"]],
				2:["QUANTIFIER",["INTEGER","ELISION"]],
				3:["QUANTIFIER",["INTEGER","ELISION","INTEGER"]]
				},
		MATRICE:{
				1:[,,'s3','g2'],
				2:[,,,,'a'],
				3:[,'s4',,,'r1'],
				4:[,,'s5',,'r2'],
				5:[,,,,'r3']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) QUANTIFIER' -> QUANTIFIER END_TOKENS":
					return RHS[0];
				case "(1) QUANTIFIER -> INTEGER":
				case "(2) QUANTIFIER -> INTEGER ELISION":
				case "(3) QUANTIFIER -> INTEGER ELISION INTEGER":
					var n = RHS[0].oValue.value
					var m = RHS[1]  
							? ( RHS[2] ? RHS[2].oValue.value : '\u221E' )
							: ''
					return LexerNode({
						token:'QUANTIFIER'
						,css:'quantifier'
						,n:n
						,m:m
						})
				}
			}
		}
	}