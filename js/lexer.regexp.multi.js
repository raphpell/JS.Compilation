// Lexeme REQUIS

var MultiRegExpLexer =(function( Lexer ){
	Lexer.ID = "MultiRegExpLexer"
	Lexer.Rules.makeToken =function( sName, o ){
		o = new RegExp ( o.source, 'gm' )
		o.name = sName
		return o
		}
	Lexer.Rules.makeRule =function( sName, sTokens ){
		var aList = sTokens.split('|')
		var a = []
		for(var i=0; aList[i]; i++){
			var ID = aList[i]
			var oToken = this.Tokens.list[ID]
			if( oToken ) a.push( oToken )
			else {
				var aRule = this.Rules.list[ID]
				if( ! aRule ) throw Error ('Rule "'+ ID +'" Not Found !' )
				a = a.concat( aRule )
				}
			}
		return a
		}
	Lexer.prototype.searchToken =function( oRE ){
		oRE.lastIndex = this.nPos
		if( ! oRE.test( this.sText ) || this.previous.invalidFor( oRE.name )) return false;
		oRE.lastIndex = this.nPos
		var result = oRE.exec( this.sText )
		if( result === null || result.index != this.nPos || ! result[0].length )
			return null
		this.sToken = oRE.name
		return this.sValue = result[0]
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