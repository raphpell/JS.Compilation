var GrammarParserEngine={
	GRAMMAR :{
		SYMBOLS:{
			"PRODUCTION":1,
			"GRAMMAR":2,
			"PRODUCTIONS":3
			},
		PRODUCTIONS:{
			1:["GRAMMAR",["PRODUCTIONS"]],
			2:["GRAMMAR",["&epsilon;"]],
			3:["PRODUCTIONS",["PRODUCTION","PRODUCTIONS"]],
			4:["PRODUCTIONS",["PRODUCTION"]]
			},
		MATRICE:{
			1:['r2','s4','g2','g3'],
			2:['a'],
			3:['r1'],
			4:['r4','s4',,'g5'],
			5:['r3']
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
					RHS[0].appendChild( ParserLR.parse( aTokens, GrammarParserEngine.PRODUCTION ))
					o.appendChild( RHS[0])
					o.appendChild( RHS[1])
					return o;
				case "(4) PRODUCTIONS -> PRODUCTION":
					var aTokens = to_array( RHS[0].childNodes )
					RHS[0].innerHTML = ''
					RHS[0].appendChild( ParserLR.parse( aTokens, GrammarParserEngine.PRODUCTION ))
					return RHS[0]
				}
			}
		},
	PRODUCTION :{
		SYMBOLS:{
			"LHS":1,
			"RHS":2,
			"PRODUCTION":3
			},
		PRODUCTIONS:{
			1:["PRODUCTION",["LHS","RHS"]],
			2:["PRODUCTION",["&epsilon;"]]
			},
		MATRICE:{
			1:['r2','s3',,'g2'],
			2:['a'],
			3:[,,'s4'],
			4:['r1']
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
					o.appendChild( ParserLR.parse( aTokens, GrammarParserEngine.RHS ))
					return o;
				case "(2) PRODUCTION -> &epsilon;": return false;
				}
			}
		},
	RHS:{
		SYMBOLS:{
			"PIPE":1,
			"SYMBOL":2,
			"SYMBOL_EPSILON":3,
			"RHS":4,
			"UNION":5,
			"CONCAT":6,
			"SYMBOLS":7
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
			1:['r2',,'s6','s7','g2','g3','g4','g5'],
			2:['a'],
			3:['r1'],
			4:['r4','s8'],
			5:['r6','r6','s6','s7',,,'g9','g5'],
			6:['r7','r7','r7','r7'],
			7:['r8','r8','r8','r8'],
			8:[,,'s6','s7',,'g10','g4','g5'],
			9:['r5','r5'],
			10:['r3']
			},
		AST:function( sProd, LHS, RHS ){
			var o
			switch( sProd ){
				case "(0) RHS' -> RHS END_TOKENS": return RHS[0];
				case "(1) RHS -> UNION": return RHS[0];
				case "(2) RHS -> &epsilon;": return false;
				case "(3) UNION -> CONCAT PIPE UNION":
					if( RHS[0] && RHS[2] ){
						o = Lexeme({token:'PIPE',css:'alternation'})
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
						o = Lexeme({token:'CONCAT',css:'concat'})
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
