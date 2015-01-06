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
		var tag =function(s,color){ return '<b style="color:'+color+'">'+s+'</b>'}
		, red =function(s){ return tag(s,'red')}
		, green =function(s){ return tag(s,'green')}
		, black =function(s){ return tag(s,'black')}
		, simpleresult =function( o1 ){
			return o1.lastTime.toFixed(2) +' ms'+
				'<br>min:'+ o1.min.toFixed(2) +
				'<br>moy:'+ o1.moy.toFixed(2) +
				'<br>max:'+ o1.max.toFixed(2) +
				'<br>nbre:'+ o1.count
			}
		, result =function( n1, bInf, bSup ){
			return bInf ? green( n1)
				: ( bSup ? red( n1 )
					: black( n1 ))
			}
		var o1 = this[nID]
		if( ! o1 ) return '...'
			else if( arguments.length == 1 )
				return simpleresult( o1 )
		var bTimeInf=1, bTimeSup=1
		, bMinInf=1, bMinSup=1
		, bMoyInf=1, bMoySup=1
		, bMaxInf=1, bMaxSup=1
		for(var i=1, a=arguments, ni=a.length; i<ni; i++ ){
			var o2 = this[a[i]]
			if( ! o2 ) continue ;
			if( bTimeInf ) bTimeInf = o1.lastTime <= o2.lastTime
			if( bTimeSup ) bTimeSup = o1.lastTime >= o2.lastTime
			if( bMinInf ) bMinInf = o1.min <= o2.min
			if( bMinSup ) bMinSup = o1.min >= o2.min
			if( bMoyInf ) bMoyInf = o1.moy <= o2.moy
			if( bMoySup ) bMoySup = o1.moy >= o2.moy
			if( bMaxInf ) bMaxInf = o1.max <= o2.max
			if( bMaxSup ) bMaxSup = o1.max >= o2.max
			}
		return  result( o1.lastTime.toFixed(2), bTimeInf, bTimeSup ) +' ms'+
				'<br>min:'+ result( o1.min.toFixed(2), bMinInf, bMinSup ) +
				'<br>moy:'+ result( o1.moy.toFixed(2), bMoyInf, bMoySup ) +
				'<br>max:'+ result( o1.max.toFixed(2), bMaxInf, bMaxSup ) +
				'<br>nbre:'+ o1.count
		}
	aStats.get =function( nID ){ return this[nID] }
	aStats.init =function( nID ){ return this[nID] = null }
	aStats.reset =function( nID ){
		for(var s in this ){
			var o = Stats[s]
			if( o && o.count ) delete Stats[s]
			}
		}
	aStats.set =function( nID, n ){
		var o = this[nID]
		if( ! o ) o = this[nID] = { key:nID, lastTime:n, min:n, moy:n, max:n, sum:n, count:1 }
		else {
			o = this[nID]
			o.lastTime = n
			if( n < o.min ) o.min = n
			if( n > o.max ) o.max = n
			o.sum += n
			o.count++
			o.moy = o.sum / o.count
			}
		return n.toFixed(2) +' ms<br>min:'+ o.min.toFixed(2) +'<br>moy:'+ o.moy.toFixed(2) + '<br>max:'+ o.max.toFixed(2) + '<br>nbre:'+ o.count
		}
	return aStats
	})()