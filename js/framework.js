Object.prototype.union = function( o, b ){
	if( b ) for( n in o ){ if( !this[n]) this[n]=o[n] }
		else for( n in o ) this[n]=o[n]
	return this
	}
Object.prototype.inheritFrom =function( fClass ){
	var F = function(){}
	F.prototype = fClass.prototype
	this.prototype = new F
	this.prototype.constructor = this
	this.superclass = fClass
	if( fClass.prototype ) fClass.prototype.constructor = fClass
	return this.prototype
	}
	
Array.prototype.union({
	have :function(m,b){
		if(b){ for(var i=0,n=this.length;i<n;i++) if(this[i]===m )	return true }
		else { for(var i=0,n=this.length;i<n;i++) if(this[i]==m)	return true }
		return false
		},
	haveIntersectionWith :function(a,b){
		for(var i=0,n=a.length;i<n;i++) if( this.have(a[i],b)) return true
		return false
		},
	remove :function(m){
		for(var i=0,n=this.length;i<n;i++)
			if(this[i]==m) return this.splice(i,1)
		return null
		},
	sortBy :function(s1,s2){
		var s1=s1?"['"+s1.str_replace("\.","']['" )+"']":''
		, a={'ASC':['<','>'],'DESC':['>','<']}[ s2 || 'ASC' ]
		return this.sort( function (m1,m2){
			return eval('m1'+s1+a[0]+'m2'+s1)?-1:(eval('m1'+s1+a[1]+'m2'+s1)?1:0)
			})
		}
	})

Array.union({
	unique :function( a1 ){
		var a2=[]
		for(var i=0, ni=a1.length; i<ni; i++ ){
			var m = a1[i]
			if( m!=undefined && ! a2.have( m )) a2.push( m )
			}
		return a2
		},
	diff :function( a, a1, a2 /*, aj, ... */ ){
		var ai=a.concat([]), nj=arguments.length
		nextElt:
			for(var i=0; i<ai.length; i++)
				for(var j=1; j<nj; j++){
					if( ! arguments[j]) continue;
					if( arguments[j].have( ai[i])){
						ai.splice( i--, 1 )
						continue nextElt;
						}
					}
		return ai
		},
	intersect :function( /*,aj, ... */ ){
		if( arguments.length==2 ){
			var a = []
			var ai = arguments[0]
			for( var i=0, ni=ai.length; i<ai.length; i++ )
				if( arguments[1].have( ai[i]))
					a.push( ai[i])
			return a
			}
		var ni = arguments.length
		var a = arguments[0]
		for( var i=1; i<ni; i++ )
			a = Array.intersect( a, arguments[i])
		return a
		}
	})
	
to_array =function( M ){
	switch( M.constructor ){
		case Array : return M
		case Function :
		case String : return [ M ]
		default: if( M.length >= 0 ){
			for( var i=0 , aA = [] , n = M.length ; i < n ; i++ ) aA.push( M[i])
			return aA
			}
		}
	return [ M ]
	}

String.prototype.union({
	str_replace :function( m1, m2 ){
		var s = this
		, a1 = to_array( m1 )
		, a2 = to_array( m2 )
		, b = [String,Function].have( m2.constructor )
		for( var i=0, ni=a1.length, m, re ; i<ni; i++ ){
			m = a1[i]
			re = m.constructor==RegExp ? m : new RegExp ( RegExp.escape( m ), 'g' )
			s = s.replace( re , b ? a2[0] : ( a2[i] || '' ))
			}
		return s
		},
	toArray :function(){
		var a=[]
		var s = this
		s = s.replace( /\\c[a-zA-Z]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}/g, // |\\.
			function( sMatched, nIndex ){
				a.push( sMatched )
				return ''
				})
		for(var i=0, ni=s.length; i<ni; i++ )
			a.push( s.charAt( i ))
		return a
		},
	countLines :function(){
		var a = this.match( /\n|\f|\r\n?/gim )
		return a ? a.length + 1 : 1
		}
	})

RegExp.escape =function( s ){
	return s.replace( /(\.|\?|\*|\+|\\|\(|\)|\[|\]|\}|\{|\$|\^|\|)/g , "\\$1" )
	}

	
/*
	Divers...
*/
_ =function( sIds ){
	var collect =function( s ){
	//	if( window[s]) return window[s]
		return window[s] = document.getElementById(s)
		}
	var args = sIds.split(',')
	if( args.length == 1 ) return collect( sIds )
	else for( var i=0, a=[], ni=args.length; i<ni; i++ )
		a.push( collect( args[i]))
	return a
	}
showFrom =function( eShow, e ){
	return eShow.onchange =function(){
		e.style.display= eShow.checked ? '':'none'
		}
	}

CallBack =function( o, m ){
	var a=to_array(arguments).slice(2), f=m.constructor
	if(f==String)f =function(){
		if(o[m])return o[m].apply(o,to_array(arguments).concat( a ))
		throw new Error ( m +  "\nNOT_A_METHOD")
		}
	if(f==Function)f =function(){
		return m.apply(o,to_array(arguments).concat( a ))
		}
	return f
	}

Chrono = function(){ this.start()}
Chrono.prototype={
	start: function(){ this.dStart = performance.now()},
	stop: function(){
		this.dStop = performance.now()
		var nTime = ( this.dStop - this.dStart ).toFixed(3)
		if( this.onstop ) this.onstop( nTime )
		return nTime
		}
	}

Bufferize=(function(){
	var BUFFER = ''
	var f=function( s ){ return BUFFER += s }
	f.init=function( s ){ var sTMP = BUFFER; BUFFER = s||''; return sTMP }
	return f
	})()

// Chargement de fichier...
LoadFile =(function(){
	var eBODY = document.lastChild.lastChild
	return function( sFileName, fOnLoad ){
		var eIFRAME = document.createElement('IFRAME')
		eIFRAME.style.display = 'none'
		eIFRAME.onload =function(){
			var e = eIFRAME.contentWindow.document.firstChild
			if( e ){
				while( e && e.nodeType!=3 ) e = e.lastChild 
				if( e ){
					fOnLoad( e.nodeValue )
					return eBODY.removeChild( eIFRAME )
					}
				}
		//	fOnLoad( 'Une erreur est survenu pendant le chargement du fichier.' )
		//	console.warn( eIFRAME, e )
			}
		eBODY.appendChild( eIFRAME )
		eIFRAME.src = sFileName
		}
	}())

// Fenêtre 'modale' de l'application
SubWindow =function( sUrl, sName, sWidth, sHeight, sFunctionName ){
	var oWindow
	sWidth = sWidth || 600  
	sHeight = sHeight || 400 
	var Cotes =(function(){
		var o ={
			a:[ 'width='+sWidth,'height='+sHeight ],
			save :function(){
				if( oWindow )
				o.a =[
					'width='+	( oWindow.innerWidth || sWidth ),
					'height='+	( oWindow.innerHeight || sHeight ),
					'screenX='+	( oWindow.screenX || null ),
					'screenY='+	( oWindow.screenY || null )
					]
				}
			}
		return o
		})()
	var f=function( m ){
		if( oWindow && oWindow.opener!=window ) oWindow.close()
		if( ! oWindow || oWindow.closed ){
			oWindow = this.oWindow = window.open( f.url, sName || '_INFO', "resizable=yes,scrollbars=yes,status=yes,"+ Cotes.a )
			try{ oWindow.onblur =function(){ Cotes.save()} }catch(e){}
			}
		oWindow.document.location.href = f.url
		oWindow.focus()
		if( ! sFunctionName ) return true
		f.type = m && m.type || "DFA"
		var nInterval = setInterval( function(){
			try{
				if( oWindow[sFunctionName]){ clearInterval(nInterval); oWindow[sFunctionName](m);}
				}catch(e){ clearInterval(nInterval); oWindow.close(); f(m); console.warn( e.message ) }
			}, 200 )
		}
	f.type = null
	f.url = sUrl
	f.refresh =function( m ){
		if( oWindow && ! oWindow.closed ) oWindow[sFunctionName]( m )
		}
	return f
	}
previewREScanning =SubWindow( "src/regexp/preview.htm", "PreviewRE", 600, 650, 'setInput' )
regexpSyntax =SubWindow( "src/regexp/syntax.htm" )
wizSyntax =SubWindow( "src/wiz/syntax.htm" )
grammarSyntax =SubWindow( "src/grammar/syntax.htm" )
previewFA =SubWindow( "AF.preview.htm", "PreviewFA", 600, 600, 'setFA' )
