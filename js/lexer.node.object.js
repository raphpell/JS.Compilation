
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
			for(var i=0; a[i]; i++) this.appendChild( a[i])
			return o
			}
		if( o===this || o.isAncestor( this ))
			Exception("HIERARCHY_REQUEST_ERR")
		if( o.parentNode ) o = o.parentNode.removeChild( o )
		o.ownerRoot = this.ownerRoot
		o.parentNode = this
		if( o.previousSibling = this.lastChild ) this.lastChild.nextSibling = o
		if( ! this.childNodes.length ) this.firstChild = o 
		this.childNodes.push( this.lastChild = o )
		if( this.ownerRoot ) this.ownerRoot.addId( o )
		return o
		},
	cloneNode :function( bDeep ){
		if( this.nodeType == Node.FRAGMENT_NODE ){
			var a = this.childNodes
			for( var i=0, aClones=[], n=a.length; i<n; i++ )
				aClones [i] = a [i].cloneNode( bDeep )
			return new this.constructor( aClones )
			}
		var aExclude = 'ownerRoot,childNodes,nextSibling,previousSibling,firstChild,lastChild,parentNode'.split( ',' )
		, Clone =function( o, b ){
			this.constructor = o.constructor
			for(var s in o ){
				var m = o[s]
				if( m && ( typeof m == "object" ))
					this[s] = ( in_array( s, aExclude ) || m.ownerDocument )
						? null
						: new Clone ( m, true )
					else this[s] = m
				}
			if( o.childNodes ){
				if( ! b ) this.childNodes = []
					else {
						var a = [], ni = o.childNodes.length
						for( var i=0; i<ni; i++ ) a[i] = new Clone ( o.childNodes[i], b )
						for( var i=0; i<ni; i++ )
							a[i].union({
								nextSibling: i<ni-1 ? a[i+1] : null,
								previousSibling: i>0 ? a[i-1] : null,
								parentNode: this
								})
						this.union({
							firstChild: a[0] || null,
							lastChild: a[ a.length-1 ] || null,
							childNodes: a
							})
						}
				}
			this.ownerRoot = o.ownerRoot || null
			}
		var o = new Clone ( this, bDeep )
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
		if( ! o ) return Exception("UNDEFINED_ERR")
		if( this.readOnly ) return Exception("NO_MODIFICATION_ALLOWED_ERR")
		var a = this.childNodes
		, n = a.indexOf(o)
		, o1 = o.previousSibling
		, o2 = o.nextSibling
		if( ~n ){
			a.splice(n,1)
			o.ownerRoot = o.parentNode = o.nextSibling = o.previousSibling = null
			if( n==0 && (this.firstChild=o2 ))
				o2.previousSibling = null
			else if( n==a.length && (this.lastChild=o1))
				o1.nextSibling = null
			else if( a.length ){
				o2.previousSibling = o1
				o1.nextSibling = o2
				}
			if( this.ownerRoot ) this.ownerRoot.removeId( o )
			return o
			}
		return Exception("NOT_FOUND_ERR")
		},
	replaceChild :function( o1, o2 ){
		this.insertBefore( o1, o2 )
		return this.removeChild( o2 )
		}
	}
