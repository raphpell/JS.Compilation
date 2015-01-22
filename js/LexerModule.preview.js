var valueToString =function(o){
	return JSON.stringify( o, 'token,parentToken,css,index,lineStart,lineEnd'.split(','), " " ).str_replace('"', '')
	}
var LexerNode =function( o ){
	var sToken = o.token
	, e = document.createElement( sToken )
	, sValue = o.value
	e.oValue = o
	e.title = valueToString( o )
		// sToken +'\n\u25B6'+ sValue +'\u25C0'
	if( sValue ) e.innerHTML = sValue.str_replace( ['&','<','>'], ['&amp;','&lt;','&gt;'])
	e.className = 'myNode'
	if( o.css ) e.className += ' '+ o.css
	return e
	}
	
var match =function(){
	eResult.innerHTML = ''
	try{
		var sText = eInput.value
		if( sText.substr(0,9)=='<![CDATA[' )
			sText = eInput.value = sText.slice( 9, -3 )
		var eLexer = AutomatonLexer( sText, sLexerRule )
		eResult.appendChild( eLexer )
	}catch(e){
		eResult.innerHTML = e.message + '<br>'
		if( e.fileName ) eResult.innerHTML += '<br>fichier: '+ e.fileName.split('/').pop()
		if( e.lineNumber ) eResult.innerHTML += '<br>ligne: '+ e.lineNumber
		}
	}

_( 'eInput,eBtnMatch,eRelief,eWhiteSpaces,eResult' )
var changeClassList =function( b, sClass ){
	if( eResult.classList ) eResult.classList[ b?'add':'remove']( sClass )
		else eResult.className = (eRelief.checked?'relief':'')+' '+(eWhiteSpaces.checked?'seeWS':'')
	}
eBtnMatch.onclick = match
eRelief.onclick = function(){ changeClassList( eRelief.checked, 'relief' )}
eRelief.onclick()
eWhiteSpaces.onclick = function(){ changeClassList( eWhiteSpaces.checked, 'seeWS' )}
eWhiteSpaces.onclick()
match()