
/*----------------------------------
	- class SimpleNode 
----------------------------------*/
var splice =function( a, n ){
	if(!a.length)return;
	while(n<a.length)a[n]=a[++n]
	--a.length
	}
var indexOf =function( a, o ){
	for(var i=0;a[i];i++)
		if(a[i]===o)return i
	return -1
	}

SimpleNode =function( s1 ){
	if( s1 )this.nodeName = s1
	this.childNodes=[]
	}
SimpleNode.prototype ={
	nodeName:null,
	parentNode:null,
	firstChild:null,
	lastChild:null,
	previousSibling:null,
	nextSibling:null,
	appendChild :(function(){
		var doIt =function( o ){
			if( o.parentNode ) o = o.parentNode.removeChild( o )
			o.parentNode = this
			if( o.previousSibling = this.lastChild ) this.lastChild.nextSibling = o
			return doIt.update( this, o, this.childNodes )
			}
		doIt.update =function( oP, oC, a ){
			if( ! a.length ) oP.firstChild = oC 
			a.push( oP.lastChild = oC )
			return oC
			}
		return doIt
		})(),
	hasChildNodes :function(){
		return this.childNodes.length
		},
	insertBefore :(function(){
		var doIt =function( o, oRefChild ){
			if( ! oRefChild ) return this.appendChild( o )
			if( o.parentNode ) o.parentNode.removeChild( o )
			doIt.updateAttributes( this, oRefChild.previousSibling, o, oRefChild )
			this.childNodes = doIt.updateChilds( this.childNodes, o, oRefChild )
			return o
			}
		doIt.updateAttributes =function( oP, oPS, o, oNS ){
			if( oPS ) oPS.nextSibling = o
				else oP.firstChild = o
			oNS.previousSibling = o
			o.parentNode = oP
			o.previousSibling = oPS
			o.nextSibling = oNS
			}
		doIt.updateChilds =function( a, o, oRefChild ){
			for(var i=0; a[i]; i++) if( a[i]===oRefChild ) break
			return a.slice( 0, i ).concat( [ o ]).concat( a.slice( i, a.length ))
			}
		return doIt
		})(),
	removeChild :(function(){
		var doIt =function( o ){
			return doIt.update( this, this.childNodes, this.childNodes.indexOf(o), o ) // indexOf(a,o)
			}
		doIt.update=function( oP, a, i, oC ){
			if( ~i ){
				splice(a,i)
				doIt.updateAttributes( oP, a.length, i, oC.previousSibling, oC.nextSibling )
				oC.parentNode = oC.nextSibling = oC.previousSibling = null
				return oC
				}
			return null
			}
		doIt.updateAttributes =function( oP, nLength, i, oPS, oNS ){
			if( i==0 && (oP.firstChild=oNS ))
				oNS.previousSibling = null
			else if( i==nLength && (oP.lastChild=oPS))
				oPS.nextSibling = null
			else if( nLength ){
				oNS.previousSibling = oPS
				oPS.nextSibling = oNS
				}
			}
		return doIt
		})()
	}
