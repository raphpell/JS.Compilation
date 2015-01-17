
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
	appendChild :function( o ){
		if( o.parentNode ) o = o.parentNode.removeChild( o )
		// Pas fait ici normalement
		else o.nextSibling = o.previousSibling = null
		o.parentNode = this
		if( this.lastChild ){
			o.previousSibling = this.lastChild
			this.lastChild.nextSibling = o
			} else this.firstChild = o 
		this.childNodes[ this.childNodes.length ] = this.lastChild = o
		return o
		},
	removeChild :function( o ){
		var a = this.childNodes
		, n = a.indexOf(o)
		//, n = indexOf(a,o)
		, o1 = o.previousSibling
		, o2 = o.nextSibling
		if( ~n ){
			splice(a,n)
			// Attention: à décommenter
			// o.parentNode = o.nextSibling = o.previousSibling = null
			if( n==0 && (this.firstChild=o2 ))
				o2.previousSibling = null
			else if( n==a.length && (this.lastChild=o1))
				o1.nextSibling = null
			else if( a.length ){
				o2.previousSibling = o1
				o1.nextSibling = o2
				}
			return o
			}
		return null
		},
	replaceChild :function( o1, o2 ){
		this.insertBefore( o1, o2 )
		return this.removeChild( o2 )
		}
	}
