/*----------------------------------
	- class Node 
----------------------------------*/
Node =function( s1, s2, s3 ){
	if( s1 )this.nodeName = s1
	if( s2 )this.nodeValue = s2
	if( s3 )this.nodeType = s3
	this.childNodes=[]
	}
Node.union({
	ELEMENT_NODE:1,
	ROOT_NODE:2,
	FRAGMENT_NODE:3
	}) 
Node.prototype ={
	nodeName:null,
	nodeValue:null,
	nodeType:null,
	parentNode:null,
	firstChild:null,
	lastChild:null,
	previousSibling:null,
	nextSibling:null,
	ownerRoot:null,
	appendChild :function( o ){
		if( ! o ) return Exception("UNDEFINED_ERR")
		if( this.readOnly ) return Exception("NO_MODIFICATION_ALLOWED_ERR")
		if( o.nodeType == Node.FRAGMENT_NODE ){
			var a = o.childNodes
			for(var i=0, n=a.length; i<n; i++ )
				this.appendChild( a[i])
			return o
			}
		if( o === this ) Exception("HIERARCHY_REQUEST_ERR")
		if( o.isAncestor( this )) Exception("HIERARCHY_REQUEST_ERR")
		var o2 = o.parentNode
		if( o2 ) o = o2.removeChild( o )
		o.ownerRoot = this.ownerRoot
		o.nextSibling = null
		o.parentNode = this
		o.previousSibling = this.lastChild
		if( o2 = this.lastChild ) o2.nextSibling = o
		if( this.childNodes.length==0 ) this.firstChild = o 
		this.lastChild = o
		this.childNodes.push( o )
		if( this.ownerRoot ) this.ownerRoot.addId( o )
		return o
		},
	getElementsByTagName :function( s ){
		var a = []
		, o = this.firstChild
		while( o ){
			if( o.nodeName == s || s == "*" ) a.push( o )
			a = a.concat( o.getElementsByTagName( s ))
			o = o.nextSibling
			}
		return a
		},
	hasChildNodes :function(){
		var a = this.childNodes
		return a ? a.length>0 : false
		},
	insertBefore :function( o, oRefChild ){
		var a
		if( ! o ) return Exception( "UNDEFINED_ERR" )
		if( this.readOnly ) return Exception( "NO_MODIFICATION_ALLOWED_ERR" )
		if( ! oRefChild ) return this.appendChild( o )
		if( o.nodeType == Node.FRAGMENT_NODE ){
			a = o.childNodes
			for( var i=0, n=a.length; i<n; i++ )
				this.insertBefore( a[i], oRefChild )
			return o
			}
		if( o === this ) Exception( "HIERARCHY_REQUEST_ERR" )
		if( o.isAncestor( this )) Exception( "HIERARCHY_REQUEST_ERR" )
		if( oRefChild.parentNode !== this ) Exception( "NOT_FOUND_ERR" )
		var a, o2
		if( o2 = o.parentNode ) o = o2.removeChild( o )
		if( o2 = oRefChild.previousSibling ) o2.nextSibling = o 
		oRefChild.previousSibling = o
		if( ! o2 ) this.firstChild = o 
		o.ownerRoot = this.ownerRoot
		o.parentNode = this
		o.previousSibling = o2
		o.nextSibling = oRefChild
		a = this.childNodes
		for( var i=0, n=a.length; i<n; i++ ) if( a[i]===oRefChild ) break
		this.childNodes = a.slice( 0, i ).concat( [ o ]).concat( a.slice( i, a.length ))
		if( this.ownerRoot ) this.ownerRoot.addId( o )
		return o
		},
	isAncestor :function( o ){
		if( o ) while( o = o.parentNode ) if( o===this ) return true
		return false
		},
	isRoot :function(){
		return this.parentNode === this.ownerRoot
		},
	removeChild :function( o ){
		if( ! o ) return Exception( "UNDEFINED_ERR" )
		if( this.readOnly ) return Exception( "NO_MODIFICATION_ALLOWED_ERR" )
		if( o.parentNode != this ) return Exception( "NOT_FOUND_ERR" )
		var o1 = o.nextSibling, o2 = o.previousSibling
		if( o1 ) o1.previousSibling = o2
		if( o2 ) o2.nextSibling = o1
		var a = this.childNodes , bFound = false
		for( var i=0, n=a.length; i<n; i++ )
			if( a[i]===o ){
				bFound = ( a.splice( i, 1 ))[0]
				break
				}
		this.firstChild = a[0]
		this.lastChild = a[ a.length-1 ]
		this.childNodes = a
		if( this.ownerRoot ) this.ownerRoot.removeId( o )
		if( bFound ){
			o.ownerRoot = null
			o.parentNode = null
			o.nextSibling = null
			o.previousSibling = null
			return o
			} return Exception( "NOT_FOUND_ERR" )
		},
	replaceChild :function( o1, o2 ){
		this.insertBefore( o1, o2 )
		return this.removeChild( o2 )
		}
	}

/*----------------------------------
	- class Fragment
----------------------------------*/
Fragment =function( a ){
	Node.call( this, null, null, Node.FRAGMENT_NODE )
	this.childNodes = a || []
	}
Fragment.inheritFrom( Node )