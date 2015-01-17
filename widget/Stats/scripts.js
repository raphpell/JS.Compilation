var benchmark =(function(){
	var f =function( fRepeated, time ){
		var nIntervalID = null
		var fFunction = function(){
			nIntervalID = nIntervalID
				? clearInterval( nIntervalID )
				: setInterval( fRepeated, time || f.time )	
			}
		fFunction.fRepeated = fRepeated
		return fFunction
		}
	f.time = 1000
	return f
	})()
var BenchmarkFunctions =(function(){
	nTestID = 1
	return function( e, o, sFunctionsName, f ){
		var highlight =function( e ){
			if( ! e ) return ;
			if( ! e.className ){
				e.className = 'highlight'
				setTimeout( function(){ e.className = '' }, 250 )
				}
			}
		var addTest =function( sFunctionName ){
			var s = sFunctionName +'Old'
			o[ s ] = o[ sFunctionName ]
			var eStat = e.appendChild( document.createElement('DIV'))
			eStat.innerHTML = sFunctionName
			if(!o[s]) return eStat.style.backgroundColor = 'red'
			var nStat = nTestID++
			o[ sFunctionName ]=function(){
				var oObject = this[ s ] ? this : o
				, oArgs= arguments
				, oChrono = new Chrono
				, m = oObject[s].apply(this,oArgs)
				, nTime = oChrono.stop()
				eStat.innerHTML =(function(){
					var a = []
					try{
						for(var i=0, ni=oArgs.length; i<ni; i++) a.push( JSON.stringify( oArgs[i]))
						}catch(e){ a.push('???') }
					return sFunctionName
						+'<br><small>('+ a.join(',') + ')</small>'
						+'<br><pre>'+ Stats.set( nStat, nTime ) +'</pre>'
					})()
				if( f ) f( eStat )
				else highlight( eStat )
				return m
				}
			}
		for(var i=0, a=sFunctionsName.split(','), ni=a.length; i<ni; i++ )
			addTest( a[i])
		}
	})()
var Stats =(function(){
	var aStats = []
	aStats.compare =function( nID, nID2 ){
		var o1 = this[nID]
		, bTimeInf=1, bTimeSup=1
		, bMinInf=1, bMinSup=1
		, bMoyInf=1, bMoySup=1
		, bMaxInf=1, bMaxSup=1
		if( ! o1 ) return '...'
			else if( arguments.length == 1 )
				return aStats.print.only( o1 )
		for(var i=1, a=arguments, ni=a.length; i<ni; i++ ){
			var o2 = this[a[i]]
			if( ! o2 ) continue ;
			if( bTimeInf ) bTimeInf = o1.now <= o2.now
			if( bTimeSup ) bTimeSup = o1.now >= o2.now
			if( bMinInf ) bMinInf = o1.min <= o2.min
			if( bMinSup ) bMinSup = o1.min >= o2.min
			if( bMoyInf ) bMoyInf = o1.moy <= o2.moy
			if( bMoySup ) bMoySup = o1.moy >= o2.moy
			if( bMaxInf ) bMaxInf = o1.max <= o2.max
			if( bMaxSup ) bMaxSup = o1.max >= o2.max
			}
		
		var mask =function(){
			var a=[]
			for(var n=0, ni=arguments.length; n<ni; a[n]=( arguments[n++] ? 1 : 0 ));
			return a
			}
		return aStats.print.result( o1, mask( bTimeInf, bTimeSup, bMinInf, bMinSup, bMoyInf, bMoySup, bMaxInf, bMaxSup ))
		}
	aStats.get =function( nID ){ return this[nID] }
	aStats.init =function( nID ){ return this[nID] = null }
	aStats.reset =function( nID ){
		for(var s in this ){
			var o = Stats[s]
			if( o && o.tot && s!='print' ) delete Stats[s]
			}
		}
	
	aStats.getTime =function( n ){
		return n.toFixed(2) +' ms'
		}
	aStats.print ={
		now:1,
		min:1,
		moy:1,
		max:1,
		tot:1,
		sum:0,
		times :function( nNow, nMin, nMoy, nMax, nTot, nSum ){
			var a =[]
			if( this.now ) a.push( 'now: ' +nNow )
			if( this.min ) a.push( 'min: '+ nMin )
			if( this.moy ) a.push( 'moy: '+ nMoy )
			if( this.max ) a.push( 'max: '+ nMax )
			if( this.tot ) a.push( 'tot: '+ nTot )
			if( this.sum ) a.push( 'sum: '+ nSum )
			return a.join('<br>')
			},
		only :function( o ){
			return this.times(
				aStats.getTime( o.now ),
				aStats.getTime( o.min ),
				aStats.getTime( o.moy ),
				aStats.getTime( o.max ),
				o.tot,
				o.sum.toFixed(2) +' ms'
				)
			},
		result :function( o, a ){
			var tag =function(s,color){ return '<b style="color:'+color+'">'+s+'</b>'}
			var f =function( s, bInf, bSup ){
				return bInf
					? tag(s,'green')
					: ( bSup
						? tag(s,'red')
						: tag(s,'black')
						)
				}
			return this.times(
				f( aStats.getTime( o.now ), a[0], a[1] ),
				f( aStats.getTime( o.min ), a[2], a[3] ),
				f( aStats.getTime( o.moy ), a[4], a[5] ),
				f( aStats.getTime( o.max ), a[6], a[7] ),
				o.tot,
				f( o.sum.toFixed(2) +' ms', a[4], a[5] )
				)
			}
		}
	aStats.set =function( nID, n ){
		var o = this[nID]
		if( ! o ) o = this[nID] = { key:nID, now:n, min:n, moy:n, max:n, sum:n, tot:1 }
		else {
			o = this[nID]
			o.now = n
			if( n < o.min ) o.min = n
			if( n > o.max ) o.max = n
			o.sum += n
			o.tot++
			o.moy = o.sum / o.tot
			}
		return this.print.only(o)
		}
	return aStats
	})()