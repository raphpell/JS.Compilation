// lexer.class.js requis

var MultiRegExpLexer =(function( Lexer ){
	Lexer.ID = "MultiRegExpLexer"
	Lexer.Rules.makeToken =function( sName, o ){
		o = new RegExp ( o.source, 'g' )
		o.name = sName
		return o
		}
	Lexer.prototype.searchToken =function( oRE ){
		oRE.lastIndex = this.nPos
		if( oRE.test( this.sText ) && this.previous.validFor( oRE.name )){
			oRE.lastIndex = this.nPos
			var result = oRE.exec( this.sText )
			if( result === null || result.index != this.nPos || ! result[0].length )
				return null
			this.sToken = oRE.name
			return this.sValue = result[0]
			}
		return false;
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