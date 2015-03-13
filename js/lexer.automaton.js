// lexer.class.js requis

var AutomatonLexer =(function( Lexer ){
	Lexer.ID = "AutomatonLexer"
	var nextState =function( oFA, sStateI, sChar ){
		var cache = oFA.cache || ( oFA.cache = [] )
		cache = cache[sStateI] || ( cache[sStateI] = {} )
		if( cache[sChar]) return cache[sChar]
		var o = oFA.M[sStateI], sStateF
		return cache[sChar] = 
			sChar.length && o && ( o[ oFA.A[sChar]] || (function(){
				if( oFA.R )
					for(var i=0; a=oFA.R[i]; i++)
						if( ( sStateF = a[1]( sChar, o[a[0]]||0 )) > 0 )
							return sStateF
				})())
			|| -2 
		}

	// Compression des automates
	, f=function( sCharSet, bIn ){
		var cache = {}
		for(var i=0, ni=sCharSet.length; i<ni; i++ ) cache[ sCharSet[i]] = -1
		return bIn
			? function(symb,state){ return cache[symb] ? state : -1 }
			: function(symb,state){ return cache[symb] || state }
		}
	, g=function( /* sSymb1, ... */ ){ 
		var o = {}
		for(var i=0, ni=arguments.length; i<ni; i++ ) o[ arguments[i]] = i
		return o
		}
	, h=function( nLength, nDefaultValue /*,  nIndex1, nValue1, ...*/){
		var a = []
		var o = {}
		for(var i=2, ni=arguments.length; i<ni; i=i+2 ) o[ arguments[i]] = arguments[i+1]
		for(var i=0; i<nLength; i++ ) a[i] = o[i]!=undefined ? o[i] : nDefaultValue
		return a
		}

	Lexer.Rules.union({
		makeToken :function( sName, o ){
			o.name = sName
			if( ! o.TokensTable ) o.TokensTable = [,sName]
			return o
			},
		addTokenFromString :function( sName, sDFA ){
			var o;
			eval('o='+sDFA);
			this.addTokens([[ sName, o ]])
			}
		})
	
	Lexer.union({
		insert :function( fModule ){
			fModule( Lexer.Rules, f, g, h )
			}
		})
	// SCANNING
	Lexer.prototype.searchToken =function( oDFA ){
		var nEnd=this.nPos, sState=1, oFound=null
		if( this.previous.invalidFor( oDFA.name )) return false;
		while( ( sState = nextState( oDFA, sState, this.sText.charAt( nEnd++ ))) > 0 ){
			if( oDFA.F[ sState ]){
				sDFA = oDFA.TokensTable[ oDFA.F[ sState ]]
				if( this.previous.invalidFor( sDFA )) continue;
				oFound={ end:nEnd, token:sDFA }
				}
			}
		if( ! oFound ) return null
		this.sToken = oFound.token
		return this.sValue = this.sText.substring(this.nPos,oFound.end)
		}

	// Analyse par défaut
	;(function(){
		var o = Lexer.Rules
		o.addTokens([
			// Espaces blancs
			['SPACES',{A:g(" "),M:[,[2]],F:[,,1]}],
			['TAB',{A:g("\t"),M:[,[2]],F:[,,1]}],
			['L_NEW_LINE',{A:g("\n","\f","\r"),M:[,[3,3,2],[3]],F:[,,1,1]}],
			['WHITE_SPACES',{A:g("[\t \n\r\f]"),R:[[0,f("\t \n\r\f",1)]],M:[[],[2],[2]],F:[,,1]}],
			// Tout sauf un espaces blancs
			['NOT_WHITE_SPACES',{A:{"[^\t \n\r\f]":0},R:[[0,f("\t \n\r\f")]],M:[[1],[1]],F:{1:1}}],
			// Syntaxe par défaut
			['TXT',{A:g("\n","[^\t\n\f\r ]","\t","\f","\r"," "),R:[[1,f("\t\n\f\r ")]],M:[[],[5,3,4,5,2,6],[5],[,3]],F:[,,3,5,2,3,4],TokensTable:',,TAB,L_NEW_LINE,SPACES,TEXT'.split(',')}]
			])
		o.addCSSClass( 'space=SPACES&tab=TAB&linefeed=L_NEW_LINE&whitespaces=WHITE_SPACES&undefined=NOT_WHITE_SPACES' )
		o.setTokensTranslation('L_NEW_LINE=NEW_LINE')
		})();

	return Lexer
	})( LexerClass()) 