var WizParserEngine={
	ITEMS :{
		SYMBOLS:{
			"BLOCK":1,
			"COMPIL":2,
			"IDENTIFIER":3,
			"REQUIRED":4,
			"RULE":5,
			"WIZ":6,
			"ITEMS":7,
			"ITEM":8,
			"OBJECT":9
			},
		PRODUCTIONS:{
			1:["WIZ",["ITEMS"]],
			2:["WIZ",["&epsilon;"]],
			3:["ITEMS",["ITEM","ITEMS"]],
			4:["ITEMS",["ITEM"]],
			5:["ITEM",["COMPIL","IDENTIFIER","OBJECT"]],
			6:["ITEM",["IDENTIFIER","OBJECT"]],
			7:["ITEM",["REQUIRED"]],
			8:["OBJECT",["RULE"]],
			9:["OBJECT",["RULE","BLOCK"]],
			10:["OBJECT",["BLOCK"]],
			11:["OBJECT",["&epsilon;"]]
			},
		MATRICE:{
			1:['r2',,'s5','s6','s7',,'g2','g3','g4'],
			2:['a'],
			3:['r1'],
			4:['r4',,'s5','s6','s7',,,'g8','g4'],
			5:[,,,'s9'],
			6:['r11','s12','r11','r11','r11','s11',,,,'g10'],
			7:['r7',,'r7','r7','r7'],
			8:['r3'],
			9:['r11','s12','r11','r11','r11','s11',,,,'g13'],
			10:['r6',,'r6','r6','r6'],
			11:['r8','s14','r8','r8','r8'],
			12:['r10',,'r10','r10','r10'],
			13:['r5',,'r5','r5','r5'],
			14:['r9',,'r9','r9','r9']
			},
		AST:function( sProd, LHS, RHS ){
			var newNode = ParserLR.Node
			var o
			switch( sProd ){
				case "(0) WIZ' -> WIZ END_TOKENS": return RHS[0];
				case "(1) WIZ -> ITEMS": return RHS[0];
				case "(2) WIZ -> &epsilon;": return false;
				case "(3) ITEMS -> ITEM ITEMS":
					o = newNode( LHS )
					o.appendChild( RHS[0])
					if( RHS[1].nodeName=='ITEMS' ){
						for(var e=RHS[1].firstChild; e ;  ){
							var oNode = e
							e=e.nextSibling
							o.appendChild( oNode )
							}
						} else o.appendChild( RHS[1])
					return o
				case "(4) ITEMS -> ITEM": return RHS[0];
				case "(5) ITEM -> COMPIL IDENTIFIER OBJECT":
				case "(6) ITEM -> IDENTIFIER OBJECT":
					o = newNode( 'ITEM' )
					o.appendChild( RHS[0])
					o.appendChild( RHS[1])
					if( RHS[2]) o.appendChild( RHS[2])
					return o;
				case "(7) ITEM -> REQUIRED": return RHS[0];
				case "(8) OBJECT -> RULE":
				case "(9) OBJECT -> RULE BLOCK":
					var oFragment = document.createDocumentFragment ()
					var oRule = Lexeme({
						token: 'RULE',
						css: 'rule',
						value: RHS[0].childNodes.length > 1
							? RHS[0].lastChild.oValue.value.trim()
							: ''
						})
					oFragment.appendChild( oRule )
					if( RHS[1]) oFragment.appendChild( ParserLR.parse( RHS[1], WizParserEngine.BLOCK ))
					return oFragment
				case "(10) OBJECT -> BLOCK":
					return ParserLR.parse( RHS[1], WizParserEngine.BLOCK );
				case "(11) OBJECT -> &epsilon;": return false;
				}
			}
		},
	BLOCK :{
		SYMBOLS:{
			"ATTRIBUTE":1,
			"E_BLOCK":2,
			"S_BLOCK":3,
			"VALUE":4,
			"BLOCK":5,
			"MEMBERS":6,
			"MEMBER":7
			},
		PRODUCTIONS:{
			1:["BLOCK",["S_BLOCK","MEMBERS","E_BLOCK"]],
			2:["MEMBERS",["MEMBER","MEMBERS"]],
			3:["MEMBERS",["&epsilon;"]],
			4:["MEMBER",["ATTRIBUTE","VALUE"]]
			},
		MATRICE:{
			1:[,,,'s3',,'g2'],
			2:['a'],
			3:[,'s6','r3',,,,'g4','g5'],
			4:[,,'s7'],
			5:[,'s6','r3',,,,'g8','g5'],
			6:[,,,,'s9'],
			7:['r1'],
			8:[,,'r2'],
			9:[,'r4','r4']
			},
		AST:function( sProd, LHS, RHS ){
			var newNode = ParserLR.Node
			var o
			switch( sProd ){
				case "(0) BLOCK' -> BLOCK END_TOKENS": return RHS[0];
				case "(1) BLOCK -> S_BLOCK MEMBERS E_BLOCK": return RHS[1];
				case "(2) MEMBERS -> MEMBER MEMBERS":
					o = document.createDocumentFragment ()
					o.appendChild( RHS[0])
					if( RHS[1]){
						if( RHS[1].nodeName=='MEMBERS' ){
							for(var e=RHS[1].firstChild; e ;  ){
								var oNode = e
								e=e.nextSibling
								o.appendChild( oNode )
								}
							} else o.appendChild( RHS[1])
						}
					return o
				case "(3) MEMBERS -> &epsilon;": return false;
				case "(4) MEMBER -> ATTRIBUTE VALUE":
					var sTokenName = RHS[0].oValue.value
					var eValue = RHS[1].getElementsByTagName( 'VALUE_IN' )[0]
					o = Lexeme({
						token: sTokenName,
						css: sTokenName.toLowerCase(),
						value: eValue ? eValue.oValue.value.trim() : ''
						})
					return o;
				}
			}
		}
	}
