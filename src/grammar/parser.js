var GrammarParserEngine={
	GRAMMARS :{ // INUTILISABLE
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"LHS":1,
				"PIPE":2,
				"SYMBOL":3,
				"SYMBOL_EPSILON":4,
				"GRAMMAR":5,
				"PRODUCTIONS":6,
				"PRODUCTION":7,
				"RHS":8,
				"UNION":9,
				"CONCAT":10,
				"SYMBOLS":11,
				"END_TOKENS":12
				},
		PRODUCTIONS:{
				1:["GRAMMAR",["PRODUCTIONS"]],
				2:["GRAMMAR",["&epsilon;"]],
				3:["PRODUCTIONS",["PRODUCTION","PRODUCTIONS"]],
				4:["PRODUCTIONS",["PRODUCTION"]],
				5:["PRODUCTION",["LHS","RHS"]],
				6:["RHS",["UNION"]],
				7:["UNION",["CONCAT","PIPE","UNION"]],
				8:["UNION",["CONCAT"]],
				9:["CONCAT",["SYMBOLS","CONCAT"]],
				10:["CONCAT",["SYMBOLS"]],
				11:["SYMBOLS",["SYMBOL"]],
				12:["SYMBOLS",["SYMBOL_EPSILON"]]
				},
		MATRICE:{
				1:[,'s5',,,,'g2','g3','g4',,,,,'r2'],
				2:[,,,,,,,,,,,,'a'],
				3:[,,,,,,,,,,,,'r1'],
				4:[,'s5',,,,,'g6','g4',,,,,'r4'],
				5:[,,,'s11','s12',,,,'g7','g8','g9','g10'],
				6:[,,,,,,,,,,,,'r3'],
				7:[,'r5',,,,,,,,,,,'r5'],
				8:[,'r6',,,,,,,,,,,'r6'],
				9:[,'r8','s13',,,,,,,,,,'r8'],
				10:[,'r10','r10','s11','s12',,,,,,'g14','g10','r10'],
				11:[,'r11','r11','r11','r11',,,,,,,,'r11'],
				12:[,'r12','r12','r12','r12',,,,,,,,'r12'],
				13:[,,,'s11','s12',,,,,'g15','g9','g10'],
				14:[,'r9','r9',,,,,,,,,,'r9'],
				15:[,'r7',,,,,,,,,,,'r7']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) GRAMMAR' -> GRAMMAR END_TOKENS": return RHS[0];
				case "(1) GRAMMAR -> PRODUCTIONS": return RHS[0];
				case "(2) GRAMMAR -> &epsilon;": return RHS[0];
				case "(3) PRODUCTIONS -> PRODUCTION PRODUCTIONS": return RHS[0];
				case "(4) PRODUCTIONS -> PRODUCTION": return RHS[0];
				case "(5) PRODUCTION -> LHS RHS": return RHS[0];
				case "(6) RHS -> UNION": return RHS[0];
				case "(7) UNION -> CONCAT PIPE UNION": return RHS[0];
				case "(8) UNION -> CONCAT": return RHS[0];
				case "(9) CONCAT -> SYMBOLS CONCAT": return RHS[0];
				case "(10) CONCAT -> SYMBOLS": return RHS[0];
				case "(11) SYMBOLS -> SYMBOL": return RHS[0];
				case "(12) SYMBOLS -> SYMBOL_EPSILON": return RHS[0];
				}
			}
		},
	GRAMMAR :{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"PRODUCTION":1,
				"GRAMMAR":2,
				"PRODUCTIONS":3,
				"END_TOKENS":4
				},
		PRODUCTIONS:{
				1:["GRAMMAR",["PRODUCTIONS"]],
				2:["GRAMMAR",["&epsilon;"]],
				3:["PRODUCTIONS",["PRODUCTION","PRODUCTIONS"]],
				4:["PRODUCTIONS",["PRODUCTION"]]
				},
		MATRICE:{
				1:[,'s4','g2','g3','r2'],
				2:[,,,,'a'],
				3:[,,,,'r1'],
				4:[,'s4',,'g5','r4'],
				5:[,,,,'r3']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) GRAMMAR' -> GRAMMAR END_TOKENS": return RHS[0];
				case "(1) GRAMMAR -> PRODUCTIONS": return RHS[0];
				case "(2) GRAMMAR -> &epsilon;": return false;
				case "(3) PRODUCTIONS -> PRODUCTION PRODUCTIONS":
					o = document.createDocumentFragment()
					var aTokens = to_array( RHS[0].childNodes )
					RHS[0].innerHTML = ''
					RHS[0].appendChild( ParserLR( aTokens, GrammarParserEngine.PRODUCTION ))
					o.appendChild( RHS[0])
					o.appendChild( RHS[1])
					return o;
				case "(4) PRODUCTIONS -> PRODUCTION":
					var aTokens = to_array( RHS[0].childNodes )
					RHS[0].innerHTML = ''
					RHS[0].appendChild( ParserLR( aTokens, GrammarParserEngine.PRODUCTION ))
					return RHS[0]
				}
			}
		},
	PRODUCTION :{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"LHS":1,
				"RHS":2,
				"PRODUCTION":3,
				"END_TOKENS":4
				},
		PRODUCTIONS:{
				1:["PRODUCTION",["LHS","RHS"]],
				2:["PRODUCTION",["&epsilon;"]]
				},
		MATRICE:{
				1:[,'s3',,'g2','r2'],
				2:[,,,,'a'],
				3:[,,'s4'],
				4:[,,,,'r1']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) PRODUCTION' -> PRODUCTION END_TOKENS": return RHS[0];
				case "(1) PRODUCTION -> LHS RHS":
					o = document.createDocumentFragment()
					o.appendChild( RHS[0])
					if( RHS[1].firstChild.nodeName=='RARROW' ) RHS[1].removeChild( RHS[1].firstChild )
					if( RHS[1].lastChild.nodeName=='NEW_LINE' ) RHS[1].removeChild( RHS[1].lastChild )
					var aTokens = to_array( RHS[1].childNodes )
					RHS[1].innerHTML = ''
				//	RHS[1].appendChild( )
					o.appendChild( ParserLR( aTokens, GrammarParserEngine.RHS ))
					return o;
				case "(2) PRODUCTION -> &epsilon;": return false;
				}
			}
		
		},
	RHS:{
		START:"s1",
		END:"END_TOKENS",
		SYMBOLS:{
				"PIPE":1,
				"SYMBOL":2,
				"SYMBOL_EPSILON":3,
				"RHS":4,
				"UNION":5,
				"CONCAT":6,
				"SYMBOLS":7,
				"END_TOKENS":8
				},
		PRODUCTIONS:{
				1:["RHS",["UNION"]],
				2:["RHS",["&epsilon;"]],
				3:["UNION",["CONCAT","PIPE","UNION"]],
				4:["UNION",["CONCAT"]],
				5:["CONCAT",["SYMBOLS","CONCAT"]],
				6:["CONCAT",["SYMBOLS"]],
				7:["SYMBOLS",["SYMBOL"]],
				8:["SYMBOLS",["SYMBOL_EPSILON"]]
				},
		MATRICE:{
				1:[,,'s6','s7','g2','g3','g4','g5','r2'],
				2:[,,,,,,,,'a'],
				3:[,,,,,,,,'r1'],
				4:[,'s8',,,,,,,'r4'],
				5:[,'r6','s6','s7',,,'g9','g5','r6'],
				6:[,'r7','r7','r7',,,,,'r7'],
				7:[,'r8','r8','r8',,,,,'r8'],
				8:[,,'s6','s7',,'g10','g4','g5'],
				9:[,'r5',,,,,,,'r5'],
				10:[,,,,,,,,'r3']
				},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) RHS' -> RHS END_TOKENS": return RHS[0];
				case "(1) RHS -> UNION": return RHS[0];
				case "(2) RHS -> &epsilon;": return false;
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
				case "(5) CONCAT -> SYMBOLS CONCAT":
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
				case "(6) CONCAT -> SYMBOLS": return RHS[0];
				case "(7) SYMBOLS -> SYMBOL": return RHS[0];
				case "(8) SYMBOLS -> SYMBOL_EPSILON": return RHS[0];
				}
			}
		
		}
	}
