// lexer.class.js requis

var OneRegExpLexer =(function( Lexer ){
	Lexer.ID = "OneRegExpLexer"
	Lexer.Rules.makeToken =function( sName, o ){
		o = new RegExp ( o.source, 'g' )
		o.name = sName
		return o
		}
	Lexer.Rules.makeRule =function( sName, sTokens ){
		var aList = sTokens.split('|')
		for( var aRegExp=[], aRules=[], i=0, ni=aList.length, oToken; i<ni; i++ ){
			var ID = aList[i]
			oToken = this.Tokens.list[ ID ]
			if( oToken ){
				aRules.push( oToken )
				aRegExp.push( '('+ oToken.source +')' )
				}
			else{
				var aRule = this.Rules.list[ID]
				if( ! aRule ) throw Error ('Rule "'+ ID +'" Not Found !' )
				aRules = aRules.concat( aRule[0].tokens )
				aRegExp.push( aRule[0].source )
				}
			}
		var oRE = new RegExp ( aRegExp.join('|'), 'g' )
		oRE.sId = sName
		oRE.tokens = aRules
		return Array.concat( [oRE], aRules )
		}
	Lexer.prototype.searchToken =function( oRE ){
		oRE.lastIndex = this.nPos
		var result = oRE.exec( this.sText )
		if( result === null || result.index != this.nPos || ! result[0].length )
			return null

		if( oRE.tokens ){
			/* ONLY FOR DEBUGGING PURPOSES
			if( result.length-1 != oRE.tokens.length ){
				console.warn( result.length , oRE.tokens.length )
				throw Error ( "WARN: no matching parenthesis is allowed in token regexp.\n Required non capturing parenthesis (?:regexp)" )
				}*/
			for(var i=1; result[i]===undefined; i++ );
			if( ! result[i] ) throw Error( 'Internal error' )
			this.sToken = oRE.tokens[i-1].name
			}
		else {
			this.sToken = oRE.name
			}

		return this.previous.validFor( this.sToken )
			? this.sValue = result[0]
			: false
		}
	
	// Analyse par défaut
	;(function(){
		var o = Lexer.Rules
		o.addTokens([
			// Espaces blancs
			['SPACES',/[ ]/],
			['TAB',/\t/],
			['L_NEW_LINE',/\n|\r\n?|\f/],
			['WHITE_SPACES',/[\t \n\r\f]+/],
			// Tout sauf un espaces blancs
			['NOT_WHITE_SPACES',/[^\t \n\r\f]+/],
			['TEXT',/[^\t \n\r\f]+/]
			])
		// Syntaxe par défaut
		o.addRule( 'TXT', 'TAB|L_NEW_LINE|SPACES|TEXT' )
		o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
		o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		})();
	
	return Lexer
	})( LexerClass()) 
