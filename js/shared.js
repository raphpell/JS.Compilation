Events ={
	// Attention modifié
	add :function(){
		var addEvent =function( e , s1 , f1 ){
			if( ! e || ! s1 || ! f1 ) return false ;
			var f =function(e,s1,f1){
				if( e.attachEvent ) return e.attachEvent( 'on' + s1 , f1 )
				if( e.addEventListener ) return e.addEventListener( s1 , f1 , false )
				}
			var f3 =function( evt ){
				var aArgs = to_array( arguments )
				aArgs.unshift( Events.get( aArgs.shift()))
				var m, a
				if( a=this.aEvents )
					for( var i=0, ni=a.length; i<ni; i++ )
						if( a[i] && ( a[i][0]==s1 ))
							m = a[i][1].apply( this, aArgs )
				return m
				}
			// FIREFOX
			if( s1=="mousewheel" && window.addEventListener ) return f( e, 'DOMMouseScroll', f1 )
			e.aEvents = e.aEvents || []
			e.aEvents.push([ s1, f1 ])
			e[ 'on'+ s1 ] = f3
			return e.aEvents.length-1
			}
			
		var aId=[], n=arguments.length, e=null, s=null, f=null
		for( var i=0; i<n; i++ ){
			var m = arguments[i]
			if( ! m ) e=null
				else switch( m.constructor ){
						case String: s = m ; f = null; break;
						case Function:
							if( e ){
								f = m;
								break;
								}
						default: e = m; f = null
						}
			if(e&&s&&f) aId.push( addEvent( e, s, f ))
			}
		return aId
		},
	remove :function(){
		var n = arguments.length , e = null
		,removeEvent =function( e , ni ){
			if( e.aEvents && e.aEvents[ ni ]) e.aEvents[ ni ] = null
			return null
			}
		,purge =function( m ){
			if( m && m.aEvents ){
				for( var a = [], i = 0 , ni = m.aEvents.length ; i < ni ; i++ )
					if( m.aEvents[i])
						a.push( m.aEvents[i])
				m.aEvents = a
				}
			}
		for( var j = 0 ; j < n ; j++ ){
			var m = arguments[j]
			if( ! m && m != 0 ) e = null // throw new Error ( "removeEvents : the argument " + j + "/" + n + " is undefined." )
			if( e && in_array( m.constructor , [ Array , Number ])){
				m = to_array( m )
				for( var i = 0 , ni = m.length ; i < ni ; i++ ) removeEvent( e , m[i])
				purge( e )
				} else e = m
			}
		return null
		},
	get :function( evt ){
		return evt?evt:(window.event?window.event:null)
		},
	element :function( m ){
		if(!m)return null
		if(m.nodeName)return m
		if(m.type){
			m=Events.get(m)
			return m.target?(m.target.nodeType==3?m.target.parentNode:m.target):m.srcElement
			}
		return false
		},
	prevent :function( evt, sButNotInTags ){
		var e = Events.element( evt )
		if( sButNotInTags && ~sButNotInTags.indexOf( e.nodeName.toUpperCase())) return true
		if(evt=Events.get(evt)){
			evt.returnValue=false
			if(evt.preventDefault)evt.preventDefault() 
			}
		return false
		},
	stop :function( evt ){
		if(evt=Events.get(evt)){
			evt.cancelBubble=true
			if(evt.stopPropagation)evt.stopPropagation() 
			}
		return false
		},
	preventSelection :function( b, e, sButNotInTags ){
		e = e || document
		var s = 'aSelectionDisabled'
		if( b && ! e[s]){
			var f=function(evt){ return Events.prevent( evt, sButNotInTags )}
			e[s] = Events.add( e, 'mousedown', f, 'selectstart', f )
			}
		if( ! b && e[s])
			e[s] = Events.remove( e, e[s])
		}
	}

call =function( o1, s1 ){
	var a1 = to_array( arguments ) , a = [0]
	for( var i = 2 , ni = a1.length ; i < ni ; i++ )
		a.push( a1[ i ])
	var f1 =function( evt ){
		a[0]=Events.get( evt )
		if( o1[ s1 ]) return o1[ s1 ].apply( o1 , a )
		}
	return f1
	}
var eHEAD = null, eBODY = null
window.LOADED = false
var Browser = Fx = Color = Style = CssRules = false

Bitmask =function(){
	var sMask=''
	for(var n=0, ni=arguments.length; n<ni; sMask+=( arguments[n++ ] ? 1 : 0 ));
	return { n:parseInt(sMask,2), s:sMask }
	}

extend =function( o, m, bPreserve ){
	if( ! o ) return ;
	var b = bPreserve || false , s
	if( m )switch( m.constructor ){
		case Array: for( var i = 0 , n = m.length ; i < n ; i++) extend( o , m[i] , b )
			break;
		default:for( var s in m ){
			if( s=="prototype" ) continue
			if( o[s] == undefined ) o[s] = m[s]
				else if( ! b )
					switch( o[s].constructor ){
						case Array: o[s] = Array.merge( o[s] ,to_array( m[s]))
							break
						default:
							if( s == "style" ) for( var s2 in m[s]) o[s][s2] = m[s][s2] 
								else try{ o[s]=m[s] }catch( e ){ alert( "extend:\n" + s + "\n" + o[s] + "\n" + m[s] + "\n" + e.message )}
						} 
				}
			if( m.prototype ) extend( o.prototype , m.prototype , true )
		}
	return o
	}
each =function( m, f1, aTargetedConstructors, m2 ){
		var a1 = ( m2 && m2.constructor == Array ) ? m2 : []
		, aTarget = aTargetedConstructors || false
		, f = m.constructor || ""
		, o1 = ( ! m2 || m2.constructor == Array ) ? window : m2
		switch(f){
			case Array: for( var i = 0 , ni = m.length ; i < ni ; i++ )
					if( m[i] != undefined && (  ! aTarget || in_array( m[i].constructor , aTarget )))
						f1.apply( o1 ,[ m[i] ,i ].concat( a1 ))
				break;
			default: for( var s in m ) 
					if( m[s] != undefined && ( ! aTarget || in_array( m[s].constructor , aTarget )))
						f1.apply( o1 ,[ m[s] , s ].concat( a1 ))
			}
		return m
		}
clone =function( m ){ 
	if( in_array( m.constructor , [ Boolean, Number, String, Date, Function ]))
		return m.valueOf()
	var m2 = new m.constructor
	for( var i in m )
		m2[i] = m[i] ? clone( m[i]) : m[i]
	return m2
	}

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
to_string =function( m, a ){
	var s = "" , a = a ? a : []
	if( m ) switch( m.constructor ){
		case Array :
			for( var i = 0 , n = m.length , a1 = [] ; i < n ; i++ ) a1.push( to_string( m[i] , a ))		
			s = "[" + a1.join( "," ) + "]"
			break
		case Boolean: s = m.toString(); break
		case RegExp: s = m.source;break
		case Number :s = m; break
		case Object :
			if( in_array( m , a , true )) s += "@RECURSION@"
				else{
					a.push( m )
					var a1 = []
					for( var i in m )
						if( m[i].constructor != Function )
							a1.push( i + ":" + to_string( m[i] , a ))
					s = "{" + a1.join( "," ) + "}"
					}
			break
		case String : s = "'" +  m.replace( /([^/])'/ , "$1\\'" ) + "'"; break
		case Function : s = m.toString(); break
		default : ;
		} else s = m
	return s ? s : "''"
	}

isset =function( m ){ return m !== undefined }
in_array =function( M , A , bStrict ){ return A.contain( M , bStrict )}
str_replace =function( A1, A2, m ){
	return m[ m.constructor==Array ? 'replace' : 'str_replace' ]( A1, A2 )
	}

getElementsByTagName =function(s1){return document.getElementsByTagName(s1)}
getTags =function( s, e ){
	e=e||document
	return e.getElementsByTagName(s)
	}
write =function(sText){return document.write(sText)}

_ =function( sId ){
	var collect =function( s ){
	//	if( window[s]) return window[s]
		return window[s] = document.getElementById(s)
		}
	var args = to_array( arguments ).join(',').split(',')
	if( args.length==1 ) return collect( sId )
	else for( var i=0, a=[], ni=args.length; i<ni; i++ )
		a.push( collect( args[i]))
	return a
	}

Object.prototype.extend =function( mSources, b ){
	return extend( this, mSources, b )
	}
Object.prototype.acquire =function( mSources, b ){
	return extend( this, mSources, b )
	}
Object.prototype.union =function( o, b ){
	if( b ) for( var n in o ){ if( !this[n]) this[n]=o[n] }
		else for( var n in o ) this[n]=o[n]
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
	
RegExp.acquire({
	escape :function( s ){
		return s.replace( /(\.|\?|\*|\+|\\|\(|\)|\[|\]|\}|\{|\$|\^|\|)/g , "\\$1" )
		}
	})

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

Function.prototype.acquire({
	alter :function(fA,oA){
		var fun=this,oA=oA||window
		return function(){
			return fun.apply(oA,[fA.apply( oA, arguments )].concat( to_array( arguments )))
			}
		},
	prefix :function(fA,oA,bA){
		var fun=this,oA=oA||window
		return function(){
			var a=arguments,r1=fun.apply(oA,a),r2=fA.apply(oA,a)
			return bA?r1:r2
			}
		},
	suffix :function(fA,oA,bA){
		var fun=this,oA=oA||window
		return function(){
			var a=arguments,r1=fA.apply(oA,a),r2=fun.apply(oA,a)
			return bA?r1:r2
			}
		}
	})

/*@cc_on 
var fEvery = Array.prototype.every
var fFilter = Array.prototype.filter
@*/
Array.acquire({
	merge :function(){
		for( var a1=[], a2=to_array( arguments ), i=0, n=a2.length ; i<n ; i++ ) a1=a1.concat( a2[i])
		return a1
		},
	flip :function( a ){
		var key, tmp=[]
		for( key in a ){
			if( !a.hasOwnProperty( key )) continue;
			tmp[a[key]]=key
			}
		return tmp
		},
	unique :function( a1 ){
		for( var a2=[], a3=[], i=0, n=a1.length ; i<n ; i++ ){
			var mValue=a1[i],s1=to_string( mValue )
			if( ! in_array( s1 , a3 )){ a2.push( mValue ); a3.push( s1 )}
			}
		return a2
		}
	})
Array.prototype.acquire({
	diff :function( a ){
		var ai = a.concat([])
		var nj = arguments.length
		nextElt:
			for( var i=0; i<ai.length; i++ )
				for( var j=1; j<nj; j++ )
					if( arguments[j].contain( ai[i])){
						ai.splice( i--, 1 )
						continue nextElt;
						}
		return ai
		},
	every :function( f, o ){
		/*@cc_on  return fEvery.call( this, f, o ) @*/
		for( var i=0, ni=this.length; i<ni; i++ )
			if( ! f.call( o, this[i], i, this ))
				return 0
		return 1
		},
	filter :function( f, o ){
		/*@cc_on  return fFilter.call( this, f, o ) @*/
		var a=[]
		for( var i=0, ni=this.length; i<ni; i++ ){
			var m=this[i]
			if( f.call( o, m, i, this )) a.push( m )
			}
		return a
		},
	contain :function(m,b){
		var b=b||false
		for(var i=0,n=this.length;i<n;i++)
			if(b?this[i]===m:this[i]==m)return true
		return false
		},
	have :function(m,b){
		if(b){ for(var i=0,n=this.length;i<n;i++) if(this[i]===m )return true }
		else { for(var i=0,n=this.length;i<n;i++) if(this[i]==m)  return true }
		return false
		},
	indexOf :function(m){
		for(var i=0,n=this.length;i<n;i++)
			if(this[i]===m)return i
		return -1
		},
	remove :function(m0){
		for(var i=0,n=this.length;i<n;i++)
			if(this[i]==m0)return this.splice(i,1)
		return null
		},
	replace :function(A1,A2){
		var a = []
		for(var i=0,n=this.length;i<n;i++){
			a[i]=this[i].str_replace(A1,A2)
			}
		return a
		},
	sum :function(){
		for(var i=0,ni=this.length,n=0;i<ni;i++) n+=a[i]
		return n
		},
	sortBy :function(s1,s2){
		var s1=s1?"['"+s1.str_replace("\.","']['" )+"']":''
		, o={'ASC':['<','>'],'DESC':['>','<']}
		, a=o[s2||'ASC']||o['ASC']
		function sortObject(m1,m2){
			return eval('m1'+s1+a[0]+'m2'+s1)?-1:(eval('m1'+s1+a[1]+'m2'+s1)?1:0)
			}
		return this.sort( sortObject )
		}
	})
Array.prototype.acquire({
	item :function( i ){ return this[i] },
	indexOf :function( searchElement /*, fromIndex */ ){
        var t = Object(this)
        var len = t.length >>> 0
        if( len===0 ) return -1
        var n = 0
        if( arguments.length > 1){
            n = Number( arguments[1])
            if( n != n ) n = 0
            else if( n != 0 && n != Infinity && n != -Infinity )
                n = (n > 0 || -1) * Math.floor( Math.abs( n ))
			}
        if( n>=len ) return -1
        var k = n>=0 ? n : Math.max( len - Math.abs(n), 0 )
        for(; k<len; k++ )
            if( k in t && t[k]===searchElement ) return k
        return -1
		}
	}, true )

String.prototype.acquire({
	repeat :function( n ){
		var s = '', sThis = this + s
		while( --n >= 0 ) s += sThis
		return s
		},
	trim :function(){
		for( var s = this.replace( /^\s+/ , '' ), i = s.length - 1 ; i > 0; i--){ 
			if( /\S/.test( s.charAt( i ))){
				s = s.substring( 0, i + 1 )
				break 
				} 
			} 
		return s
		},
	str_replace :function( m1, m2 ){
		var s = this
		, a1 = to_array( m1 )
		, a2 = to_array( m2 )
		, b = in_array( m2.constructor, [String,Function])
		for( var i=0, ni=a1.length, m, re ; i<ni; i++ ){
			m = a1[i]
			re = m.constructor==RegExp ? m : new RegExp ( RegExp.escape( m ), 'g' )
			s = s.replace( re , b ? a2[0] : ( a2[i] || '' ))
			}
		/*
		each( a1, function( m , i ){
			var re = m.constructor==RegExp ? m : new RegExp ( RegExp.escape( m ) , "g" )
			//, re2 = new RegExp ( m.constructor == RegExp ? m.source : RegExp.escape( m ))
			//if( re2.test( s )) 
				s = s.replace( re , b ? a2[0] : ( a2[i] || "" ))
			})
		*/
		return s
		},
	countLines :function(){
		var a = this.match( /\n/gim )
		return a ? a.length + 1 : 1
		},
	count :function( s ){
		return this.split( s ).length-1
		}
	})

Chrono =function(){ this.start()}
Chrono.prototype={
	start: function(){ this.dStart = performance.now() },
	stop: function(){
		this.dStop = performance.now() 
		var nTime = this.dStop - this.dStart
		if( this.onstop ) this.onstop( nTime )
		return nTime
		}
	}

Widgets ={
	getId :function( sType ){
		Widgets[ sType ] = Widgets[ sType ] || 0
		return sType + Widgets[ sType ]++
		}
	}

L10N =function( sLanguage, o ){
	}
L10N.acquire({
	translate :function( s ){
		return s.replace( /@(\w+)@/gm, function( sMatched, sKey, nIndex ){ return L10N.get( sKey )})
		},
	get: function( mId ){
		var m = L10N[ mId ] || '[_' + mId + '_]'
		switch( m.constructor ){
			case Array:
				var a = to_array( arguments ), s = ""
				for(var i=0, ni=m.length; i<ni; i++ )
					s += (m[i]||'') + (a[i+1]||'')
				return s
			case String:
				if( arguments.length==1 ) return m
				var aSearched = [] , aReplacements = to_array( arguments )
				aReplacements.shift()
				for( var i=1, ni=aReplacements.length; i<=ni && i<=9; i++ ) aSearched.push( '$' + i )
				return str_replace( aSearched, aReplacements, m )
			}
		}
	})

function init (){
	window.LOADED = true
	if( ! eHEAD ) eHEAD = ( getElementsByTagName( "HEAD" ))[0]
	if( ! eBODY ) eBODY = ( getElementsByTagName( "BODY" ))[0]
	} init()
try{ Events.add( window, 'load', init )}catch(e){}

Browser =function(){
	if( Browser.cache ) return Browser.cache
	var ua= navigator.userAgent
	, o = {
		isMacOS: ua.indexOf( 'Mac OS' ) != -1,
		isIE: navigator.appName == 'Microsoft Internet Explorer',
		isNS: ua.indexOf( 'Netscape/' ) != -1
		}
	, exit =function(){ throw new Error ()}
	var a = [ 'Gecko', 'Chrome', 'Opera', 'Firefox', 'Camino', 'Safari' ]
	for( var i = 0 , ni = a.length ; i < ni ; i++ )
		o[ 'is' + a[i]] = ua.indexOf( a[i]) != -1
	try {
		if( o.isIE ){
			o.isIE = ua.replace( /^.*?MSIE\s+(\d+\.\d+).*$/, '$1' )
			if( o.isIE<6 ) exit()
			}
		if( o.isNS ){ // work only on netscape > 8 with render mode IE
			o.isNS = ua.substr( ua.indexOf( 'Netscape/' ) + 9 )
			if( o.isNS<8 || ! o.isIE ) exit()
			}
		if( o.isOpera ){	
			o.isOpera = ua.replace( /^.*?Opera.*?([0-9\.]+).*$/i, '$1' )
			if( o.isOpera<9 ) exit()
			o.isIE = false
			}
		if( o.isFirefox ) o.isFirefox = ua.replace( /^.*?Firefox.*?([0-9\.]+).*$/i , '$1' )
		if( o.isCamino ) o.isCamino = ua.replace( /^.*?Camino.*?([0-9\.]+).*$/i , '$1' )
		if( o.isSafari ) o.isSafari = o.isChrome ? true : ua.replace( /^.*?Version\/([0-9]+\.[0-9]+).*$/i , '$1' )
		if( o.isChrome ) o.isChrome = ua.replace( /^.*?Chrome\/([0-9]+\.[0-9]+).*$/i , '$1' )
		o.isValidBrowser = ( o.isIE >= 6 || o.isOpera >= 9 || o.isFirefox || o.isChrome || o.isCamino || o.isSafari >= 3 )
		}catch( e ){ o = false }
	a = [ 'IE', 'Chrome', 'Opera', 'Firefox', 'Safari', 'Camino', 'NS' ]
	for( var s='', i=0, ni=a.length; i<ni; i++ )
		if( o[ 'is' + a[i]]) s += a[i]
	o.appName = s
	Browser.cache = o
	Browser.union( o )
	return o
	}
Browser.acquire({
	viewSize :function( s ){
		if( ! s ){
			var f = this.viewSize
			return { width: f( "Width" ) , height: f( "Height" )}
			}
		return self[ "inner" + s] || document.documentElement[ "client" + s] || document.body[ "client" + s]
		},
	scrollAttr :function( s ){
		if( ! s ){
			var f = this.scrollAttr
			return { width: f( "Width" ), height: f( "Height" ), left: f( "Left" ), top : f( "Top" )}
			}
		return document.documentElement[ "scroll" + s ] || document.body[ "scroll" + s ] 
		}
	})
Browser()

Tag =function( s, o ){
	var b = s.nodeName 
	, e = b ? s : document.createElement( s )
	if( o ) extend( e, o )
	extend( e, Tag.prototype )
	return e
	}
Tag.prototype.acquire({
	cssClass :function( sClassName , sAction ){
		return Tag.className( this , sClassName , sAction )
		},
	appendNodes :function(){
		var that = this
		each( to_array( arguments ), function( e ){ if( e && e.nodeName) that.appendChild( e )})
		return this
		},
	setOpacity :function ( n ){
		var that = this
		var f =function( s ){
			var a1 = s.split ( ";" ), o = {}
			for( var i = 0 , ni = a1.length ; i < ni ; i++ ){
				var a = a1[ i ].split( ":" )
				, sAttribute = a[ 0 ].trim ()
				, sValue = ( a[ 1 ] || "" ).trim ()
				if( a.length == 2 ){
					o[ sAttribute ] = sValue
					that.style[ sAttribute  ] = str_replace( "^([\"'])([^\1]*?)\1$" , "$2" , sValue )
					}
				}
			return o
			}
		f( Style.calculate( "opacity" , n ))
		}
	})
Tag.acquire({
	addChildNodes :function( e, s, a, mSelected ){
		var eSelected = null
		, f = function( m ){
			var eChild = Tag( s )
			switch( m.constructor ){
				case Object: extend( eChild, m ) ; break
				default:
					eChild.innerHTML = str_replace( "&", "&amp;", m )
					if( s.toLowerCase() == "option" ) eChild.value = m
				}
			e.appendChild( eChild )
			}
		mSelected = mSelected || null
		if( a ){
			for( var i=0, ni=a.length; i<ni; i++ ) f( a[i])
			e.value = mSelected
			}
		return e
		},
	className :function( e, sClassName, sAction ){
		var s = e.className
		, re = new RegExp( '(?:^|\\s+)' + sClassName, 'gi' )
		, b = re.test( s )
		switch( sAction ){
			case 'add': if( ! b ) return e.className += ' '+sClassName
				break;
			case 'delete': if( b ) return e.className = s.replace( re, '' )
				break;
			case 'toggle': return Tag.className( e, sClassName, b?'delete':'add' )
				break;
			default: return b
			}
		},
	cotes :function( eNode ){
		var pos=Tag.position(eNode)
		,dim=Tag.dimension(eNode)
		return { left:pos.left , top:pos.top , width:dim.width , height:dim.height }
		},
	dimension :function( e ){
		var o1 = e.style 
		, b1 = o1.display == "none"
		, s = o1.position
		if( b1 ) extend( o1 , { position: "absolute" , display: "" })
		var oDim = { width: e.offsetWidth , height:  e.offsetHeight }
		if( b1 ) extend( o1 , { position: s , display: "none" })
		return oDim 
		},
	fullscreen :function( e, b ){
		var s = b == undefined ? 'toggle' : ( b ? 'add' : 'delete' )
		Tag.className( e, 'fullscreen', s )
		Tag.className( getTags( 'BODY' )[0], 'fullscreen', s )
		e.scrollIntoView()
		},
	interlock :function(){
		for(var i=arguments.length-1; i>0; i--)
			arguments[i-1].appendChild( arguments[i])
		return arguments[0]
		},
	outerHTML :function( e ){
		if( e.outerHTML ) return e.outerHTML
		var aAttributes = e.attributes||[], sAttrs = ''
		for( var i=0; i<aAttributes.length; i++ )
			sAttrs += ' ' + aAttributes[i].name + '="' + aAttributes[i].value + '"'
		return '<' + e.nodeName + sAttrs + '>' + e.innerHTML + '</' + e.nodeName + '>'
		},
	replaceHtml :function( e, html ){ // pour 1000 lignes : plus rapide pour moz
		/*@cc_on // Pure innerHTML is slightly faster in IE
			e.innerHTML = html;
			return e;
		@*/
		var eNewElement = e.cloneNode( false )
		eNewElement.innerHTML = html
		e.parentNode.replaceChild( eNewElement, e )
		return eNewElement
		},
	position :function( e ){
		if( e.parentNode === null || e.style.display == 'none' ) return false
		var parent = null
		, pos = {}
		, box
		if( e.getBoundingClientRect ){ // IE
			box = e.getBoundingClientRect()
			var scroll =  Browser.scrollAttr()
			, o = { left: box.left + scroll.left , top: box.top + scroll.top }
				// TEST breadcrumbs & colorpicker
				if( window.parent == window && Browser.isIE ){
					o.left -= 2
					o.top -= 2
					}
			return o
			}
		else if( document.getBoxObjectFor ) { // gecko
			box = document.getBoxObjectFor( e )
			pos =  { left: box.x , top: box.y }
			}
		else { // safari / opera
			pos = { left: e.offsetLeft, top: e.offsetTop }
			parent = e.offsetParent
			if( parent != e ){
				while( parent ){
					pos.left += parent.offsetLeft
					pos.top += parent.offsetTop
					parent = parent.offsetParent
					}
				}
			// opera & (safari absolute) incorrectly account for body offsetTop
			if( Browser.isOpera || ( Browser.isSafari && e.style.position == 'absolute' ))
				pos.top -= document.body.offsetTop
			}
		for( parent = e.parentNode ; parent && parent.tagName != 'BODY' && parent.tagName != 'HTML' ; parent = parent.parentNode ){
			pos.left -= parent.scrollLeft
			pos.top -= parent.scrollTop
			}
		return pos
		},
	removeChildNodes :function( e ){
		while(e.childNodes.length>0)e.removeChild(e.firstChild)
		},
	removeNode :function( e ){
		if( e.parentNode ) e.parentNode.removeChild( e )
		},
	setChildNodes :function( e, s, a, mSelected ){
		e.style.display = "none"
		Tag.removeChildNodes( e )
		Tag.addChildNodes( e , s , a , mSelected )
		e.value=mSelected||null
		e.style.display = ""
		}
	})

Style ={
	calculate :function( s , m ){
		var bColor = /color/i.test( s ) , sUnit = ""
		switch( s ){
			case "font-size":
			case "height":
			case "width":
				m = m < 0 ? 0 : m
				break
			case "opacity" :
				m = eval( m )
				n = m <= 0 ? 0 :( m >= 1 ? 1 : m.toFixed( 2 ))
				m = n * 100
				s = "alpha(opacity=" + m + ")"
				return [ "filter:" , s , ";-moz-opacity:" , n , ";-khtml-opacity:" , n , ";opacity:" , n , ";" ].join( "" )
				break;
			}
		switch( s ){
			// case "font-size" : sUnit = "em" ; break;
			default : sUnit = bColor ? "" : "px"
			}
		if( sUnit == "px" ) m = parseInt( m ) || 0
		return [ s , ":" , m , sUnit , ";" ].join( "" )
		},
	get :function( e , sAttr ){
		if( sAttr == "opacity" ){ sValue = e.opacity; if( sValue ) return sValue } // FOR IE
		var s = Style.getAttributeNS( sAttr )
		, sValue = e.style[s]
		if( ! sValue && in_array( s , [ "height" , "width" , "left" , "top" ])){
			o = Tag.cotes( e )
			sValue = o[s]
			}
		if( ! sValue ){
			var sClasses = e.className
			if( sClasses ){
				a = sClasses.split( " " )
				for( var i = 0 , n = a.length, sClassName, o ; i < n ; i++ ){
					sClassName = a[i].trim ()
					if( CssRules ){
						var o = CssRules.get( "." + sClassName )
						if( o ) sValue = o[s] || sValue
						}
					}
				}
			}
		if( ! sValue ){
			if( e.currentStyle ) sValue = e.currentStyle[s]
				else if( window.getComputedStyle ){
					var o = window.getComputedStyle( e , "" )
					if( o ) sValue = o.getPropertyValue( sAttr )
					}
			}
		return sValue || "0"
		},
	getAttributeNS :function( s ){
		if( s.indexOf( "-" )){
			var a = s.split( "-" )
			for( var i = 0 , s = "", n = a.length , s1 ; i < n ; i++ ){
				s1 = a[i]
				s += ( i == 0 ) ? s1 : s1.charAt( 0 ).toUpperCase() +  s1.substr( 1 )
				}
			}
		return s
		},
	remove :function( m , s ){ // m == CssRule || Element
		m = m.style
		if( m && m[s]){
			if( m.removeProperty ) m.removeProperty( s ) 
				else try{ m[s] = "" }catch(e){}
			}
		},
	set :function( m , s ){
		var e = m
		var m = m.style || m
		for( var a1 = ( m.cssText + ";" + s ).split( ";" ), o = {}, i = 0 , n = a1.length ; i < n ; i++ ){
			var a = a1[i].split( ":" )
			if( a.length == 2 && a[1]) o[ a[0].trim().toUpperCase()] = ( a[1] || "" ).trim()
			}
		s = ""
		each( o , function( value , key ){
				s += [ key , ":" , value , ";" ].join( "" )
			} , [ String, Number ])
		if( o.OPACITY ) e.opacity = o.OPACITY  // FOR IE
		return m.cssText = s
		}
	}

CssRules =(function(){
	var _oStyleSheets = document.styleSheets
	, _oStyleSheet
	, e = getTags( 'head' )[0]
	, _getRules
	, f =function(){
		e.appendChild( Tag( 'STYLE', { title:'CssRules', type:'text/css', media:'all' }))
		for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- )
			if( _oStyleSheets[i].title == 'CssRules' ){
				_oStyleSheet = _oStyleSheets[i]
				break
				}
		var b = _oStyleSheet.rules // true == IE , Safari , Chrome // false == Firefox, etc
		_getRules =(function(){
			var s = b ? 'rules' : 'cssRules'
			return function( o ){ try{ return o.cssRules }catch(e){ return null }} // UPDATED : mozilla = operation insecure
			})()
		if( ! b ){
			// if the navigator respect the standard...
			CSSStyleSheet.prototype.addRule = function( s1, s2 ){ this.insertRule( s1+'{'+s2+'}', 0 )}
			CSSStyleSheet.prototype.removeRule = CSSStyleSheet.prototype.deleteRule
			}
		}
	if( e ) f(); else throw new Error ( 'Tag HEAD undefined.' )
	return {
		add :function( s ){
			if( s ){
				var aRules = []
				for( var a = s.split('}'), i = a.length - 2 ; i >= 0 ; i-- )
					if( a[i].indexOf('{') != -1 )
						aRules.push( a[i].split('{'))
				if( aRules ) for( var i = aRules.length - 1, sName, sRule, o ; i >= 0 ; i-- ){
					sName = aRules[i][0].trim()
					sRule = aRules[i][1]
					o = this.get( sName )
					if( o ) Style.set( o, sRule ) // ne rajoute ainsi  pas un sélecteur 2 fois et permet une suppression en un coup.
						else _oStyleSheet.addRule( sName, sRule )
					}
				}
			},
		disable :function( rePattern, sAttr, bDisable ){
			sAttr = sAttr || 'href'
			for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- )
				if( rePattern.test( _oStyleSheets[i][ sAttr ]))
					_oStyleSheets[i].disabled = bDisable
			},
		get :function( s, bDelete ){
			var sToLowerCase = s.toLowerCase()
			for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- ){
				var aRules = _getRules( _oStyleSheets[i])
				if( aRules ) for( var j = 0, nj = aRules.length ; j < nj ; j++ ){
					s = aRules[j].selectorText
					if( s && s.toLowerCase() == sToLowerCase ){
						if( bDelete === true ) return _oStyleSheets[i].removeRule(j)
						return aRules[j].style
						}
					}
				}
			return false
			},
		remove :function(){
			for( var a = arguments, ni = a.length, i = 0 ; i < ni ; i++ )
				this.get( a[i].trim(), true )
			return true
			}
		}
	})()

FileSystem =(function(){
	var s = document.location.toString()
	, sCurrentPath = s.substring( 0, s.lastIndexOf( '/' )+1 )
	, oLoaded = {}
	, isLoaded =function( sFile, m ){
		var s = unescape( /^http:\/\//.test( sFile ) ? sFile : sCurrentPath + sFile )
		if( isset( m )) oLoaded[s] = m
		else{
			m = oLoaded[s]
			oLoaded[s] = true
			return m
			}
		}
	return{
		sCurrentPath: sCurrentPath,
		pathOf :function( sPattern ){
			var a = Array.merge( to_array( getElementsByTagName( 'LINK' )), to_array( getElementsByTagName( 'SCRIPT' )))
			, re = new RegExp ( sPattern, 'i' )
			for(var i=0, e, ni=a.length, s, a2; i<ni; i++ ){
				e = a[i]
				s = e.src || e.href || false
				if( s && s.match( re )){
					a2 = s.split( re )
					return str_replace( sCurrentPath, '', a2[0])
					}
				}
			return ''
			},
		isFileName :function( s ){
			if( ! s || /^\s*$/.test ( s )) return false
			return ! ( /(\\|\/|\:|\*|\?|\"|\<|\>|\|)/i.test( s ))
			// alert ( "Nom de fichier erroné.\nAu moins un des caractères \\ / : * ? \" < > | est utilisé." ) 
			},
		load :function( s, f ){
			var sExt = s.split('?').shift().split('.').pop()
			, m = isLoaded( s )
			switch( sExt ){
				case 'css': // only IE accept others extensions
					if( ! m )
						return eHEAD.appendChild( Tag( 'LINK', { rel:'stylesheet', type:'text/css', media:'all', href:s, async:true }))
					else if( m !== true ){
						m.disabled = false
						return m
						}
				case 'js': // others extensions are accepted but...
					if( ! m ){
						var e = Tag( 'SCRIPT', { type:'text/JavaScript', src:s, async:true })
						, bDone
						, fOnload =function(){ if( ! bDone ){ bDone=true; f() }}
						if( f ) Events.add( e,
							'load', fOnload,
							'readystatechange',function(){
								if( Browser.isIE && in_array( e.readyState, ['complete', 'loaded'])) fOnload()
								}
							// ! IE : 'complete','loaded', j'ai remarqué que parfois ca change... et que parfois les deux sont atteints
							)
						return eHEAD.appendChild( e )
						}
				default:
				}
			return false
			},
		unload :function( s ){
			var glob =function( e, i, sAttr ){
				if( e[ sAttr ].match( s )){
					isLoaded( e[ sAttr ], e )
					e.disabled = true
					}
				}
			each( to_array( getElementsByTagName( 'LINK' )), glob, null, [ 'href' ])
			}
		}
	})()

Mouse ={
	button :function( evt ){
		evt = Events.get( evt )
		if( in_array(  evt.type , [ "mousedown" , "mouseup" ])){
			var n = evt.which
			if( n ) switch( n ){
				case 1 : return "left"
				// case 2 : return "middle"
				case 3 : return "right"
				default: return n
				}
			n = evt.button
			if( n ) switch( n ){
				case 1 : return "left"
				case 2 : return "right"
				// case 4 : return "middle"
				default: return n
				}
			}
		return ""
		},
	position :function( evt ){
		evt = Events.get( evt )
		var o = { 
			left: evt.pageX ? evt.pageX : evt.clientX || 0 , 
			top: evt.pageY ? evt.pageY : evt.clientY || 0
			}
		/* @DELETE@
		if( Browser.isIE ){
			var o1 = Browser.scrollAttr()
			o.left +=  o1.left 
			o.top +=  o1.top
			// TEST breadcrumbs & colorpicker
			if( window.parent == window ){
				o.left -= 2
				o.top -= 2
				}
			}
		*/
		return o
		},
	wheel :function(evt){ // Pour IE et FIREFOX
		evt = Events.get( evt )
		if( in_array(  evt.type , [ "mousewheel" , "DOMMouseScroll" ])){
			var n = evt.wheelDelta ? evt.wheelDelta / 120 : -( evt.detail || 0 ) / 3
			return n < 0 ? "down" : "up"
			}
		return ""
		}
	}
	
Keyboard ={
	id:{
		8:'BACKSPACE',
		9:'TAB',
		13:'ENTER',
		16:'SHIFT',17:'CTRL',18:'ALT',
		19:'PAUSE',
		20:'CAPS_LOCK',
		27:'ESCAPE',
		33:'PAGE_UP',34:'PAGE_DOWN',
		35:'END',
		36:'HOME',
		37:'LEFT',38:'UP',39:'RIGHT',40:'DOWN',
		44:'PRINT_SCREEN',
		45:'INSERT',46:'DELETE',
		111:'DIVIDE',109:'MINUS',107:'PLUS',
		112:'F1',113:'F2',114:'F3',115:'F4',116:'F5',117:'F6',118:'F7',119:'F8',120:'F9',121:'F10',	122:'F11',123:'F12',
		144:'NUM_LOCK',145:'SCROLL_LOCK'
		},
	code :function(e){
		if(e){
			var n = e.charCode||e.keyCode||0
			// if( ! in_array( e.type, [ 'keypress','keyup' ])) // Pourquoi ? 
			// Mis en commentaire pour le module rename du treeview
			Keyboard.union({
				alt:Keyboard.AltPressed(e),
				ctrl:Keyboard.CtrlPressed(e),
				meta:e.metaKey||false,
				shift:Keyboard.ShiftPressed(e),
				charcode: n,
				key:Keyboard.id[n]||String.fromCharCode(n)
				})
			return n
			}
		return null
		},
	shortcut :function(evt){
		var n=Keyboard.code(evt),a=[]
		if(Keyboard.ctrl)a.push('CTRL')
		if(Keyboard.alt)a.push('ALT')
		if(Keyboard.shift)a.push('SHIFT')
		if(Keyboard.meta)a.push('META')
		a.push((Keyboard.id[n]||Keyboard.key).toUpperCase())
		return a.join('+')
		},
	AltPressed :function(e){
		return e.modifiers?(e.modifiers%2):e.altKey
		},
	CtrlPressed :function(e){
		return e.modifiers?((e.modifiers==2)||(e.modifiers==3)||(e.modifiers>5)):e.ctrlKey
		},
	ShiftPressed :function(e){
		return e.modifiers?(e.modifiers>3):e.shiftKey
		}
	}

ShortCut=(function(){
	var _handle=function( o ){
		var e = o.target
		if( ! e[ 'b' + o.type ])
			Events.add( e, o.type, function( evt ){
				var oSC = e.shortcuts[ Keyboard.shortcut(evt) ]
				if( oSC && oSC.type==o.type ){
					if( ! e.nWait ){
						e.nWait = true // Evite la surcharge de commande
						setTimeout( function(){ e.nWait = false }, 30 )
						var m = oSC.callback( evt )
						if( m!=undefined ) return m
						}
					Events.stop( evt )
					if( oSC.prevent ) return Events.prevent( evt )
					}
				return true
				})
		e[ 'b' + o.type ] = true
		}
	, _add=function( sShortCut, o ){
		var e = o.target
		if( ! e.shortcuts ) e.shortcuts = {}
		// NON // if( e.shortcuts[ sShortCut ]) alert( 'Collision "'+ sShortCut +'"' )
		e.shortcuts[ sShortCut ] = o
		_handle( o )
		}
	, _validate =function( s ){
		s = s.toUpperCase()
		var a = s.split('+'), aShortCut=[], n=a.length
		if(~s.indexOf('CTRL')) aShortCut.push('CTRL')
		if(~s.indexOf('ALT')) aShortCut.push('ALT')
		if(~s.indexOf('SHIFT')) aShortCut.push('SHIFT')
		if(~s.indexOf('META')) aShortCut.push('META')
		if( aShortCut.length+1==n ) aShortCut.push( a[n-1])
		return aShortCut.join('+')
		}
	var fFunction =function(){
		var s, f, e=document, a, prevent, type
		for( var i=0, ni=arguments.length; i<ni; i++ ){
			var m = arguments[i]
			switch( m.constructor ){
				case String: s=m; break;
				case Function: f=m; break;
				default: e=m; break;
				}
			if( e && s && f ){
				a=s.split(',')
				_add( _validate( a[0]), {
					callback:f,
					target:e,
					type:a[1]||'keydown',
					prevent:a[2]==undefined?true:a[2]
					})
				s = f = null
				}
			}
		}
	return fFunction
	})()