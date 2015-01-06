var oSnippets =(function(){
	var _extractTagAttributes =function( sValue, oAttributes, aAttributes, bAfter ){
		return sValue.replace( /^<([^\s>]+)(?:\s+([^\s>]+(?:\="[^\"\s>]*")?))+>/g,
			function( sMatched, $1 ){
				var sAttrs = sMatched.replace( /^<([^\s>]+)\s+/, '' ).slice( 0, -1 )
				for(var i=0, aAttrs=sAttrs.split(' '), ni=aAttrs.length; i<ni; i++ ){
					var aAttr = aAttrs[i].split('="')
					if( aAttr.length > 2 ) throw Error ( 'extraction attribute error. Do not use =" ...' )
					var oNewAttr = oAttributes.getNamedItem( aAttr[0])
					if( ! oNewAttr ){
						if( bAfter ){
							// INSERTION APRÈS
							var oAttr = document.createAttribute( aAttr[0])
							oAttr.value = aAttr[1].slice( 0, -1 )
							oAttributes.setNamedItem( oAttr )
							}
						else{
							// INSERTION AVANT
							aAttributes.push( aAttrs[i])
							}
						}
					}
				return '<'+$1+'>'
				}
			)
		}
	var _setAttributes =function( sValue, oAttributes, aAttributes ){
		for(var i=0, a=oAttributes, ni=a.length; i<ni; i++ )
			aAttributes.push( a[i].name +'="'+ a[i].value +'"' )
		var nAttrIns = sValue.indexOf('>')
		if( nAttrIns > -1 && aAttributes.length ) sValue = sValue.substr( 0, nAttrIns ) +' '+ aAttributes.join(' ') + sValue.substr( nAttrIns )
		return sValue
		}
	var _creatList =function( sTagName, sChildValue, sAttr ){
		return function(a){
			var n = parseInt(a)||0, sChild =''
			for(var i=0; i<n; i++ ) sChild += sChildValue
			return '<'+sTagName+(sAttr||'')+'>'+ ( sChild ? sChild+'\n' : '\n{child}\n' ) +'</'+sTagName+'>'
			}
		}
	var _searchValue =function( sShortCut, aChoices ){
		/*
		Recherche dans aChoices la valeur correspondant le mieux à sShortCut
			(1) Seul les valeurs ayant comme première lettre celle du raccourcie seront sélectionnées
				( + 1000 pts )
			(2) Retourne null si aucune valeur n'est déjà sélectionné
			(3) Chaque valeur est parcourue qu'une seul fois.
				( + 50 pts - la longueur de la valeur ) = Une valeur plus petite à plus de points dés le départ
			(4) Si la lettre raccourcie suivante est présente dans la valeur et quelle est précédé par le symbole '-'
				( + 500 pts pour la lettre )
					on avance à la position ( index du  '-' + 2 )
			(5) Sinon si elle est simplement présente dans la valeur :  les 12 premières positions sont privilégiées et rapportent des points, le reste en enlève
				( + 12 pts - son index dans la valeur ) pour chaque occurence trouvée
					on avance à la position ( index du caractère + 1 )
			(6) Sinon si elle n'est pas présente dedans 
				( - 2000 pts )
					la recherche des caractères raccourcie est stoppée pour la valeur
		*/
		var aResult = []
		for(var i=0, ni=aChoices.length; i<ni; i++ )
			if( aChoices[i].charAt(0)==sShortCut.charAt(0))
				aResult.push({ n:1000, text:aChoices[i] })  // 
		if( ! aResult.length ) return null
		for(var i=0, ni=aResult.length; i<ni; i++ ){
			var o = aResult[i]
			o.n = 50 - o.text.length
			var nIndex=1
			for(var j=1, nj=sShortCut.length; j<nj; j++ ){
				var sPartialValue = o.text.slice( nIndex )
				, bSpecialChar = false , bChar = false
				if( sPartialValue ){
					sPartialValue.replace(
						new RegExp( '-'+sShortCut.charAt(j)),
						function( sMatched, nPos ){
							bSpecialChar = bChar = true
							o.n += 500
							nIndex += nPos+2
							return sMatched
							}
						)
					if( ! bSpecialChar )
						sPartialValue.replace(
							new RegExp( sShortCut.charAt(j)),
							function( sMatched, nPos ){
								bChar = true
								o.n += 12-nPos
								nIndex += nPos+1
								return sMatched
								}
							)
					}
				if( ! sPartialValue || ! bChar ){
					o.n -= 2000
					break;
					}
				}
			}
		aResult.sortBy('n','DESC')
	//	console.warn( aResult )
		return aResult[0].n > 0 ? aResult[0].text : null
		}
	return {
		CSS:(function(){
			var _={
				b:'bottom',
				bd:'border',
				bdrs:'border-radius',
				bdsp:'border-spacing',
				bdw:'border-width',
				bdl:'border-left',		bdlw:'border-left-width', 
				bdr:'border-right',		bdrw:'border-right-width',
				bdt:'border-top',		bdtw:'border-top-width', bdtlrs:'border-top-left-radius', bdtrrs:'border-top-right-radius',
				bdb:'border-bottom',	bdbw:'border-bottom-width', bdblrs:'border-bottom-left-radius', bdbrrs:'border-bottom-right-radius',
				bg:'background', bgpx:'background-position-x', bgpy:'background-position-y',
				coi:'counter-increment', cor:'counter-reset',
				f:'font',
				fem:'font-emphasize',
				fz:'font-size',
				fza:'font-size-adjust',
				h:'height',
				l:'left',
				lh:'line-height',
				ls:'list-style',
				lts:'letter-spacing',
				mb:'margin-bottom', ml:'margin-left', mr:'margin-right', mt:'margin-top',
				mah:'max-height', maw:'max-width',
				mih:'min-height', miw:'min-width',
				op:'opacity',
				orp:'orphans',
				o:'outline', oo:'outline-offset', ow:'outline-width', os:'outline-style',
				of:'overflow',
				pb:'padding-bottom', pl:'padding-left', pr:'padding-right', pt:'padding-top',
				r:'right',
				t:'top',
				tr:'text-replace',
				w:'width',
				wid:'widows',
				wos:'word-spacing',
				z:'z-index'
				}
			, _aAttributesName = 'background:background:background-attachment:background-break:background-clip:background-color:background-image:background-origin:background-position:background-position-x:background-position-y:background-repeat:background-size:border:border-bottom:border-bottom-color:border-bottom-image:border-bottom-left-image:border-bottom-left-radius:border-bottom-right-image:border-bottom-right-radius:border-bottom-style:border-bottom-width:border-break:border-collapse:border-color:border-corner-image:border-fit:border-image:border-left:border-left-color:border-left-image:border-left-style:border-left-width:border-length:border-radius:border-right:border-right-color:border-right-image:border-right-style:border-right-width:border-spacing:border-style:border-top:border-top:border-top-color:border-top-image:border-top-left-image:border-top-left-radius:border-top-right-image:border-top-right-radius:border-top-style:border-top-width:border-width:bottom:box-shadow:box-sizing:caption-side:clear:clip:color:content:counter-increment:counter-reset:cursor:display:empty-cells:float:font:font:font-effect:font-emphasize:font-emphasize-position:font-emphasize-style:font-family:font-size:font-size-adjust:font-smooth:font-stretch:font-style:font-variant:font-weight:height:left:letter-spacing:line-height:list-style:list-style:list-style-image:list-style-position:list-style-type:margin:margin-bottom:margin-left:margin-right:margin-top:max-height:max-width:min-height:min-width:opacity:orphans:outline:outline-color:outline-offset:outline-style:outline-width:overflow:overflow:overflow-style:overflow-x:overflow-y:padding:padding-bottom:padding-left:padding-right:padding-top:page-break-after:page-break-before:page-break-inside:position:quotes:resize:right:table-layout:text-align:text-align-last:text-decoration:text-emphasis:text-height:text-indent:text-justify:text-outline:text-replace:text-shadow:text-transform:text-wrap:top:vertical-align:visibility:white-space:white-space-collapse:widows:width:word-break:word-spacing:word-wrap:z-index:zoom'.split(':')
			, _defaultValues ={a:'auto',i:'inherit',n:'none'}
			, _values ={
					border:{n:'none',1:'1px solid #000'},
					borderStyle:{n:'none',h:'hidden',dt:'dotted',ds:'dashed',s:'solid',db:'double',dtds:'dot-dash',dtdtds:'dot-dot-dash',w:'wave',g:'groove',r:'ridge',i:'inset',o:'outset'},
					box:{n:'none',bb:'border-box',c:'continuous',cb:'content-box',eb:'each-box',nc:'no-clip',pb:'padding-box'},
					dimension:{0:'0',2:'0 0',3:'0 0 0',4:'0 0 0 0'},
					ta:'start:end:left:right:center:justify',
					url:{c:'continue',n:'none',u:'url(|)'},
					of:'collapse:hidden:scroll:visible'
					}
			, _getDefaultValue =function( sValue ){ return _defaultValues[sValue] || sValue || '|' }
			, _getDefaultCSS =function( sName ){
				sName =_[sName] || sName
				return function(a){return sName +': '+ _getDefaultValue( a ) +';'}
				}
			return {
				alterValue :function( sNodeName, sNodeValue ){
					return sNodeName=='TEXT' ? sNodeValue +' {\n{child}\n\t}' : sNodeValue
					},
				getValueOf :function( sName ){
					var oAbbrs = this.abbreviations
					var _getGroup =function( mGroup ){
						return ! mGroup ? {} : ( mGroup.charAt ? _values[mGroup] || {} : mGroup )
						}
					var _getAbbr =function( sAttrName, mGroup1 ){
						var o1 = _getGroup( mGroup1 )
						return function(a){
							var sValue = a && mGroup1.indexOf && mGroup1.indexOf(':')>-1 ? _searchValue( a, mGroup1.split(':')) : null
							return sAttrName +': '+ ( sValue || o1[a] || _getDefaultValue( a )) +';'
							}
						}
					var getValue =function( sName ){
						if( oAbbrs[sName]) m = oAbbrs[sName]
						else{
							sName = _searchValue( sName, _aAttributesName )
							var m = oAbbrs[sName] || _getDefaultCSS( sName )
							}
						if( m.constructor==Array ){
							if( m.length==1 ) return _getAbbr.apply( this, [ sName, m[0]])
							if( m.length==2 ) return _getAbbr.apply( this, m )
							}
						return m
						}
					var getValuesPrefixed =function( sName ){
						var m = getValue( sName )
						if( m.constructor!=Function ) return m
						return function(a){
							var s = m(a)
							return [ "-moz-"+s, "-webkit-"+s, "-o-"+s, "-ms-"+s, ""+s ].join('\n')
							}
						return 
						}
					if( sName.charAt(0)=='@' && ! oAbbrs[ sName ]){
						return getValuesPrefixed( sName.slice(1))
						}
					return getValue( sName )
					},
				shortcuts: 'b:bb:bblr:bbm:bbrr:bbw:bbc:bbi:bbli:bbri:bbs:bc:bci:bcps:bf:bi:bl:blg:blc:bli:bls:br:brc:bri:brs:bsy:bt:btc:bti:btli:btri:bts:bg:bga:bgb:bgco:bgc:bgi:bgo:bgp:bgpx:bgpy:bgr:bgs:bl:blw:bm:br:bra:brw:bsp:bt:btlr:btrr:btw:bw:bsh:bsz:c:co:ci:cr:cs:ca:ct:cu:d:ec:f:fe:fem:fep:fes:ff:fl:fsy:fsm:fst:fv:fw:fs:fsa:h:l:lh:ls:ls:lsg:lsi:lsp:lst:m:mxh:mxw:mb:mnh:mnw:ml:mr:mt:oc:of:of:ofs:ofx:ofy:ol:oo:op:or:os:ow:p:pb:pba:pbb:pbi:pl:po:pr:pt:q:r:rz:t:ta:tal:tbl:td:te:th:ti:tj:to:tr:ts:tt:tw:v:va:w:wb:wos:ws:wsc:ww:wo:z:zi:'.split(':'),
				abbreviations:{
					"@i": "@import url(|);",
					"@m": "@media print {\n\t|\n\t}",
					"@f": "@font-face {\n\tfont-family:|;\n\tsrc:url(|);\n\t}",
					bg_ie: "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='|x.png');",
					i: "!important",

					'border':['border'],
					'border-break':[':close'],
					'border-collapse':['collapse:separate'],
					'border-color': "border-color:#000;",
					'border-image':['url'],
					'border-corner-image':['url'],
					'border-fit':['clip:repeat:scale:stretch:overwrite:overflow:space'],
					'border-length':[':auto'],
					'border-style':['none:hidden:dotted:dashed:solid:double:dot-dash:dot-dot-dash:wave:groove:ridge:inset:outset'],
					'border-top':['border'],
					'border-top-color': 'border-top-color: #000;',
					'border-top-image':['url'],
					'border-top-style':['borderStyle'],
					'border-top-left-image':['url'],
					'border-top-right-image':['url'],
					'border-right':['border'],
					'border-right-color':'border-right-color: #000;',
					'border-right-image':['url'],
					'border-right-style':['borderStyle'],
					'border-bottom':['border'],
					'border-bottom-color':'border-bottom-color: #000;',
					'border-bottom-image':['url'],
					'border-bottom-style':['borderStyle'],
					'border-bottom-left-image':['url'],
					'border-bottom-right-image':['url'],
					'border-left':['border'],
					'border-left-color':'border-left-color: #000;',
					'border-left-image':['url'],
					'border-left-style':['borderStyle'],
					'background':[{n:'none',a:'#FFF url(|) 0 0 no-repeat'}],
					'background-color': 'background-color: #FFF;',
					'background-image':['url'],
					'background-repeat':['no-repeat:repeat-x:repeat-y'],
					'background-attachment':['fixed:scroll'],
					'background-position': 'background-position: 0 0;',
					'background-break':[_values.box],
					'background-clip':[_values.box],
					'background-origin':[_values.box],
					'background-size':['contain:cover'],
					'box-sizing':[_values.box],
					'box-shadow': 'box-shadow: 1px 1px 12px #555;',
					'color': "color:#000;",
					'clear':['both:left:right'],
					'clip':[':rect(|)'],
					'caption-side':['top:bottom'],
					'content':['normal:open-quote:no-open-quote:close-quote:no-close-quote:attr(|):counter(|):counters(|)'],
					'cursor':['default:crosshair:hand:help:move:pointer:progress:text:wait:e-resize:ne-resize:nw-resize:n-resize:se-resize:sw-resize:s-resize:w-resize'],
					'display':['none:block:inline:inline-block:list-item:run-in:compact:table:inline-table:table-caption:table-column:table-column-group:table-header-group:table-footer-group:table-row:table-row-group:table-cell:ruby:ruby-base:ruby-base-group:ruby-text:ruby-text-group'],
					'empty-cells':['show:hide'],
					'font': "font: normal 1em Verdana, Arial;",
					'font-effect':['engrave:emboss:outline'],
					'font-family':['serif:sans-serif:cursive:fantasy:monospace'],
					'font-style':['normal:italic:oblique'],
					'font-variant':['normal:small-caps'],
					'font-weight':['normal:bold:bolder:lighter'],
					'font-emphasize-position':['before:after'],
					'font-emphasize-style':['accent:dot:circle:disc'],
					'float':['left:right'],
					'font-smooth':['auto:never:always'],
					'font-stretch':['normal:ultra-condensed:extra-condensed:condensed:semi-condensed:semi-expanded:expanded:extra-expanded:ultra-expanded'],
					'list-style':[':none'],
					'list-style-position':['inside:outside'],
					'list-style-type':['disc:circle:square:decimal:decimal-leading-zero:lower-roman:upper-roman:lower-greek:lower-latin:upper-latin:armenian:georgian:lower-alpha:upper-alpha'],
					'list-style-image':[':none'],
					'margin':['dimension'],
					'outline-color':[{i:'invert',0:'#000'}],
					'overflow':[_values.of],
					'overflow-x':[_values.of],
					'overflow-y':[_values.of],
					'overflow-style':['scrollbar:panner:move:marquee'],
					'padding':['dimension'],
					'page-break-after':['auto:always:avoid:left:right'],
					'page-break-before':['auto:always:avoid:left:right'],
					'page-break-inside':['auto:avoid'],
					'position':['static:absolute:relative:fixed'],
					'quotes':[{n:'none',ru:"'\00AB' '\00BB' '\201E' '\201C'",en:"'\201C' '\201D' '\2018' '\2019'"}],
					'resize':['both:horizontal:vertical'],
					'text-align':[_values.ta],
					'text-align-last':[_values.ta],
					'table-layout':[':fixed'],
					'text-decoration':['underline:overline:line-through'],
					'text-emphasis':[':none'],
					'text-height':['font-size:text-size:max-size'],
					'text-indent':[':-1000em'],
					'text-justify':['inter-word:inter-ideograph:inter-cluster:distribute:kashida:tibetan'],
					'text-outline':[':0 0 #000'],
					'text-transform':['capitalize:uppercase:lowercase'],
					'text-wrap':['normal:none:unrestricted:suppress'],
					'text-shadow':[':0 0 0 #000'],
					'visibility':['visible:hidden:collapse'],
					'vertical-align':['super:top:text-top:middle:baseline:bottom:text-bottom:sub'],
					'white-space':['normal:pre:nowrap:pre-wrap:pre-line'],
					'white-space-collapse':['preserve:collapse:preserve-breaks:discard'],
					'word-break':['normal:break-all:hyphenate:keep-all'],
					'word-wrap':['normal:break-word'],
					'zoom': "zoom: 1;"
					}
				}})(),
		HTML :(function(){
			var aNodesName = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|bdi|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datagrid|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp'.split('|')
			, _child = '\n{child}|\n'
			, _subchild = '\n{\tchild}\n\t|'
			, _SpecialValues ={
				cc:function(a){
					return {
						ie6: '<!--[if lte IE 6]>'+ _child +'<![endif]-->',
						ie: '<!--[if IE]>'+ _child +'<![endif]-->',
						noie: '<!--[if !IE]><!-->'+ _child +'<!--<![endif]-->'
						}[a]
						|| '<!--[if lte IE |]>'+ _child +'<![endif]-->'
					},
				html :function(a){
					var sTitle = '<head>\n' +
								'	<title></title>\n' 
					var sEnd = '</head>\n' +
								'<body>'+ _child +'</body>\n' +
								'</html>'
					return {
						xml: '<html xmlns="http:/' + '/www.w3.org/1999/xhtml"></html>',
						'4t': '<!DOCTYPE HTML PUBLIC "-/' + '/W3C/' + '/DTD HTML 4.01 Transitional/' + '/EN" "http:/' + '/www.w3.org/TR/html4/loose.dtd">\n' +
								'<html>\n' +
								sTitle +
								// '	<meta http-equiv="Content-Type" content="text/html;charset=${charset}">\n' +
								sEnd,
						
						'4s': '<!DOCTYPE HTML PUBLIC "-/' + '/W3C/' + '/DTD HTML 4.01/' + '/EN" "http:/' + '/www.w3.org/TR/html4/strict.dtd">\n' +
								'<html>\n' +
								sTitle +
								// '	<meta http-equiv="Content-Type" content="text/html;charset=${charset}">\n' +
								sEnd,
						
						'xt': '<!DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.0 Transitional/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
								'<html>\n' +
								sTitle +
								// '	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
								sEnd,
						
						'xs': '<!DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.0 Strict/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
								'<html>\n' +
								sTitle +
								// '	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
								sEnd,
						
						'xxs': '<!DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.1/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n' +
								'<html>\n' +
								sTitle +
								// '	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
								sEnd,
						
						'5': '<!DOCTYPE HTML>\n' +
								'<html>\n' +
								sTitle +
								'	<meta charset="${charset}">\n' +
								sEnd
						}[a]
					|| '<html>\n'+sTitle+sEnd
					},
				php : "<"+"?php | ?"+">",
			// lien
				a :function(a){return '<a href="'+({l:'http://',m:'mailto:'}[a]||'')+'|"></a>'},
				link :function(a){
					return '<link rel="'+ ({
						css: 'stylesheet" type="text/css" href="|style.css" media="all"',
						print: 'stylesheet" type="text/css" href="|print.css" media="print"',
						favicon: 'shortcut icon" type="image/x-icon" href="|favicon.ico"',
						touch: 'apple-touch-icon" href="|favicon.png"',
						rss: 'alternate" type="application/rss+xml" title="RSS" href="|rss.xml"',
						atom: 'alternate" type="application/atom+xml" title="Atom" href="atom.xml"',
						}[a] || 'stylesheet" href=""' ) +'>'
					},
			// image
				img: '<img src="|" alt="">',
				area :function(a){
					return '<area shape="'+ ({
						d: 'default"',
						c: 'circle" coords=""',
						r: 'rect" coords=""',
						p: 'poly" coords=""'
						}[a] || '" coords=""' ) +' href="" alt="">'
					},
				map: '<map name=""></map>',
			// multimédia
				audio: '<audio src=""></audio>',
				video: '<video src=""></video>',
				menu:function(a){
					return '<menu type="'+({c:'context',t:'toolbar'}[a]||a||'|')+'"></menu>'
					},
			// codes
				object: '<object data="" type=""></object>',
				param: '<param name="" value="">',
				embed: '<embed src="" type="">',
				iframe: '<iframe src="|" frameborder="0"></iframe>',
				script:function(a){ return a
						? '<script type="text/javascript" src="'+ a +'"></script>'
						: '<script>\n\t|\n</script>'
					},
				style: '<style type="text/css">\n\t|\n</style>',
			// listes
				dl :_creatList( 'dl', '\n\t<dt>|</dt>\n\t<dd>'+ _subchild +'</dd>' ),
				ol :_creatList( 'ol', '\n\t<li>'+ _subchild +'</li>' ),
				ul :_creatList( 'ul', '\n\t<li>'+ _subchild +'</li>' ),
			// tableaux
				table :function(a,b){
					var sChild = '\n'+ ( _creatList( 'tr', '\n\t<td>\n{\tchild\n\t}|</td>' )(b)).replace( /^/gim, '\t' )
					return _creatList( 'table', sChild )(a)
					},
				tr :_creatList( 'tr', '\n\t<td>'+ _subchild +'</td>' ),
				col : '<col span="">',
				colgroup :_creatList( 'colgroup', '\n\t<col>', ' span=""' ),
			// formulaires
				form :function(a){
					return '<form action="|"'+ ({
						g: ' method="get"',
						p: ' method="post"',
						f: ' method="post" enctype="multipart/form-data"'
						}[a]||'') +'></form>'
					},
				input :function(a){
					a ={b:'button',c:'checkbox',f:'file',h:'hidden',i:'image',p:'password',r:'radio',s:'submit',t:'text'}[a]||a
					var _={
						name: '" name="',
						nameid: '" name="" id="',
						srcalt: '" src="" alt="',
						value: '" value="'
						}
					var attr={
						button: _.value,
						checkbox: _.nameid,
						color: _.nameid,
						date: _.nameid,
						datetime: _.nameid,
						email: _.nameid,
						file: _.nameid,
						hidden: _.name,
						image: _.srcalt,
						month: _.nameid,
						number: _.nameid,
						password: _.nameid,
						radio: _.nameid,
						range: _.nameid,
						reset: _.value,
						search: _.nameid,
						submit: _.value,
						text: _.nameid,
						time: _.nameid,
						url: _.nameid,
						week: _.nameid
						}
					return '<input type="'+ ( attr[a] ? a + attr[a] : a||'' ) +'">'
					},
				label:function(a){ return '<label for="'+ (a||'') +'">|</label>'},
				select :function(a,b){
					var sChild = b
						? '\n'+ ( _creatList( 'optgroup', '\n\t<option value=""></option>', ' label=""' )(b)).replace( /^/gim, '\t' )
						: '\n\t<option value=""></option>'
					return _creatList( 'select', sChild, ' id="|" name=""' )(a)
					},
				optgroup: _creatList( 'optgroup', '\n\t<option value=""></option>' ),
				option: '<option value=""></option>',
				textarea: '<textarea id="" name=""></textarea>',
			//
			// autres
				abbr: '<abbr title=""></abbr>',	
				acronym: '<acronym title=""></acronym>',
				base: '<base href="">',
				bdo :function(a){ return'<bdo dir="'+({r:'rtl',l:'ltr'}[a]||'')+'"></bdo>'},
				br: '</br>',	
				hr: '</hr>',	
				meta:function(a,b){
					var oCharSet = {iso:"ISO-8859-1",utf:"UTF-8",win:"windows-1251"}
					return a && oCharSet[a]
						? '<meta http-equiv="Content-Type" content="text/html;charset='+ oCharSet[a] +'">'
						: '<meta name="'+ (a||'') +'" content="'+ (b||'') +'">'
					}
			//	'meta:compat': '<meta http-equiv="X-UA-Compatible" content="IE=7" />'
				}
			, _getDefaultValue =function( sTagName ){
				return sTagName
					? function(a,b){ return '<'+ sTagName +(a?' '+a:'')+'>'+ (b||'') +'</'+ sTagName +'>'}
					: '{child}'
				}

			return{
				extractAttributes : _extractTagAttributes,
				setAttributes : _setAttributes,
				getValueOf :function( sName ){
					sName = sName.toLowerCase()
					var sTagName = sName ? _searchValue( sName, aNodesName ) || sName : sName
					return _SpecialValues[ sTagName ] || _getDefaultValue( sTagName )
					},
				nodeNames: aNodesName,
				abbreviations: 'a|ab|ac|add|ap|ar|at|as|au|b|ba|baf|bdo|bdi|bg|bq|by|br|bt|cv|cp|ce|ci|cd|co|cog|cm|dtg|dtl|dd|de|det|df|dg|dir|dv|dl|dt|em|eb|fs|fc|fg|f|ftr|fm|fa|fas|h1|h6|hd|hdr|hg|hr|ht|i|if||img|inp|ins|kg|kbd|la|lg|li|lk|m|mn|mt|mtr|n|nf|ns|ob|ol|og|op|ou|p|pa|pre|pro|q|rp|rt|ru|s|sa|sc|sec|sel|sll|src|sp|stk|stg|st|sub|smm|sup|ta|tb|td|tx|tft|th|thd|tm|ttl|tr|tk|tt|u|ul|v|vi|w|x'.split('|'),
				sInline:'|TEXT|A|ABBR|ACRONYM|B|BDO|BIG|BUTTON|CITE|CODE|DEL|DFN|DT|EM|I|INPUT|INS|KBD|LABEL|LI|O|P|Q|S|SELECT|SMALL|SPAN|STRIKE|STRONG|SUB|SUP|TEXTAREA|TT|U|VAR|'
							// APPLET,BASEFONT,BR,FONT,IFRAME,IMG,,MAP,OBJECT,SAMP
				}})(),
		JS :(function(){
			var _block = '{\n{child}|\n\t}'
			, _aInstructions = 'break|case|case_break|continue|default|do_while|else|else_if|for|for_in|function|if|return|switch|while'.split('|')
			, oAbbrs ={
				'break':'break;',
				'case':function(a){ return 'case '+ (a||'|') +':\n{child}\t|' },
				'case_break':function(a){ return 'case '+ (a||'|') +':\n{child}\t|\n\tbreak;' },
				'continue':'continue;',
				'default':'default:\n{child}|',
				'do_while':function(a){ return 'do'+ _block +'while( '+ (a||'|') +' )' },
				'else': 'else'+ _block,
				'else_if':function(a){ return 'else if( '+ (a||'|') +' )'+ _block },
				'for':function(a,b,c){
					switch( arguments.length ){
						case 0: return 'for(|;;)'+ _block
						case 1:
						case 2:
							var s1 = arguments[0]
							var s2 = arguments[1]||'a|'
							if( s1.charAt(0)=='@' ){
								var sVar = s1.replace( /\@\-?/, '' )
								return s1.charAt(1)=='-'
										? 'for(var '+sVar+'=' + s2 + '.length-1; '+sVar+'>=0; '+sVar+'--)'+ _block
										: 'for(var '+sVar+'=0, n'+sVar+'=' + s2 + '.length; '+sVar+'<n'+sVar+'; '+sVar+'++)'+ _block
								}
						default:
							return 'for( '+ a +'; '+ (b||'|') +'; '+ (c||'|') +' )'+ _block
						}
					},
				'for_in':function(a,b){ return 'for( '+ (a||'|') +' in '+ (b||'|') +' )'+ _block },
				'function':function(a,b,c){
					if(!a) return 'function(|)'+ _block
					b=b||'|'; c=c||'|'
					switch( a ){
						case 'v': return 'var '+b+' =function('+c+')'+ _block
						default: return 'function '+a+' ('+b+')'+ _block
						}
					},
				'if':function(a,b){
					var fElse =function( s ){
						var sResult = ''
						if( s ){
							var a = /^\d+$/.test( s ) ? new Array ( s-1 ) : s.split( ',' )
							, ni = a.length
							for(var i=1; i<ni; i++ )
								sResult += '\nelse if( ' + (a[i]||'|') + ' )'+ _block
							if( ni > 0 ) sResult += '\nelse'+ _block
							}
						return sResult
						}
					return s = b
						? 'if( ' + (a||'|') +' )'+ _block + fElse( b )
						: a && /^\d+$/.test( a )
							? 'if( | )'+ _block + fElse( a )
							: 'if( ' + (a||'|') +' )'+ _block
					},
				'return': 'return {child}|',
				'switch':function(a,b){
					var fCase = oAbbrs['case']
					var fCases =function( s ){
						var sResult = ''
						if( s ){
							var a = /^\d+$/.test( s ) ? new Array ( parseInt( s )) : s.split( ',' )
							for(var i=0, ni=a.length; i<ni; i++ )
								sResult += '\n\t'+ fCase(a[i]).replace( ':\n{child}\t|', ':\n{\tchild}\t\t|' )
							}
						return sResult
						}
					return b
						? 'switch( ' + (a||'|') +' ){'+ fCases( b ) +'\n\t}'
						: a && /^\d+$/.test( a )
							? 'switch( | ){'+ fCases( a ) +'\n\t}'
							: 'switch( ' + (a||'|') +' )'+ _block
					},
				'while':function(a){ return 'while( '+ (a||'|') +' )'+ _block }
				}
			return {
				getValueOf :function( sName ){
					var sShortcut = _searchValue( sName, _aInstructions )
					return sShortcut ? oAbbrs[sShortcut] || sName : sName
					},
				shortcuts: 'b:c:cb:co:d:dw:e:ei:f:fi:fu:i:r:sw:wh'.split(':'),
				abbreviations: oAbbrs,
				inline: '|R|'
				}})(),
		PHP:(function(){
			return {
				getValueOf :function( sName ){
					return this.abbreviations[ sName ] || sName
					},
				'abbreviations':{
				/*
					"class" : "if( ! class_exists( '$1' )){\n\n\tclass $1 {\n\n\t\tfunction $1 (){}\n\n\t}}",
					fun: "function $1 ($2){\n\t$3\n\t}",
					"fun-": "function( $1 ){\n\t$2\n\t}",
					"fun+": "var $1 =function($2){\n\t$3\n\t}",
					"for" : "for( $i=0, $ni=|; $i<$ni; $i++){\n\t\n\t}",
					"for-" : "for( $$1; $$2; $$3 ){\n\t\n\t}",
					"for+" : "for(var $$1=0, $n$1=$a$1.length; $$1<$n$1; $$1++ ){\n\t|\n\t}"
				*/
					}
				}})()
		}
	})()
		
var Compiler =function( eAST, sContext ){
	String.prototype.repeat =function( n ){
		var s = '', sThis = this + s
		while( --n >= 0 ) s += sThis
		return s
		}
	var oSetting =oSnippets[ sContext ]
	var renameID =function( n, nTotal ){
		return n == undefined
			? function( sId ){ return sId }
			: function( sId ){
				var sReplacmt
				return sId.replace( /(\$+)(?:(@-?)(\d*))?/g, function( sMatched, sMask, sOrder, sNumber  ){
						var nNumber = parseInt(sNumber)||0
						if( ! sOrder ) sReplacmt = ''+ (n+1)
						else if( sOrder=='@-' ) sReplacmt = ''+ ( nTotal - n + ( sNumber ? nNumber-1 : 0 ))
						else if( sOrder=='@' ) sReplacmt = ''+ ( (nNumber||1) +n)
						return '0'.repeat( sMask.length - sReplacmt.length ) + sReplacmt
						})
				}
		}
	var Tag =function( sNodeName, mValue, sAbbr ){
		var e = document.createElement( sNodeName )
		if( sAbbr && oSetting.sInline )
			e.bInline = oSetting.sInline.indexOf( '|'+ sAbbr.toUpperCase() +'|' )>-1
		e.mValue = oSetting.alterValue
			? oSetting.alterValue( e.nodeName, mValue )
			: mValue
		e.aArguments = []
		e.addArgument =function(m){
			return this.aArguments.push( m )
			}
		e.addAttribute =function( sName, sValue, bConcat ){
			var oOldAttr = this.attributes.getNamedItem( sName )
			if( oOldAttr ){
				if( bConcat && oOldAttr.value ) oOldAttr.value += ' '+ sValue
					else oOldAttr.value = sValue
				}
			else{
				var oAttr = document.createAttribute( sName )
				oAttr.value = sValue
				this.attributes.setNamedItem( oAttr )
				}
			}
		e.toString =function(){
			var m = this.mValue
			// ARGUMENTS
			, s = ( m.constructor==Function ? m.apply( this, this.aArguments ) : m ) || '{child}'
			// ATTRIBUTES
			, oAttributes = this.attributes
			, aAttributes = []
			if( ! s.indexOf ) return '' // console.warn( s )
			if( oSetting.extractAttributes ) s = oSetting.extractAttributes( s, oAttributes, aAttributes )
			if( oSetting.setAttributes ) s = oSetting.setAttributes( s, oAttributes, aAttributes )
			// CHILDRENS
			if( this.firstChild ){
				var aChild = []
				for(var e=this.firstChild; e; e=e.nextSibling )
					aChild.push(
						this.bInline
							? e.toString()
							// sinon décale l'enfant d'une tabulation
							: '\t'+ e.toString().replace( /\n/g, '\n\t' )
						)
			//	var sChild = aChild.join('\n')
				var sChild = aChild.join( this.bInline ? '' : '\n' )
				if( s.indexOf('{child}') > -1 ) s = s.replace( /\{child\}/g, sChild )
				else if( /\{(\s*)child\s*\}/.test( s )){
					sChild = sChild.replace( /^/gim, s.match( /\{(\s*)child\s*\}/ )[1])
					sChild = sChild.replace( /$/gim, s.match( /\{\s*child(\s*)\}/ )[1])
					s = s.replace( /\{\s*child\s*\}/g, sChild )
					}
			//	else if( s.indexOf('><') > -1 ) s = s.replace( '><', '>\n'+ sChild +'\n<' )
				else if( s.indexOf('><') > -1 )
					s = s.replace( '><', this.bInline ? '>'+ sChild +'<' : '>\n'+ sChild +'\n<' )
			//	console.info( s )
				}
			else{
				s = s.replace( /\s*\{\s*child\s*\}\s*/g, '' )
				}
			return s
			}
		return e
		}
	var addChild =function( eParent, eAST, nIndex, nTotal ){
		var nUp = false
		var rename = renameID( nIndex, nTotal )
		for(var e = eAST.firstChild; e ; e = e.nextSibling ){
			switch( e.nodeName ){
				case "ELT":
					// ICI: La valeur du tag est modifiée pour insérer les numéros issue des masques $
					var sAbbr = rename( e.oValue.value )
					addChild(
						eParent.appendChild(
							Tag(
								'ELT',
								oSetting.getValueOf( sAbbr ),
								sAbbr
								)), e, nIndex, nTotal )
					break;
				case "STRING":
					addChild(
						// ICI: La valeur du tag est modifiée pour obtenir les sauts de lignes et les tabulations
						eParent.appendChild(
							Tag(
								'TEXT',
								rename( e.oValue.value ).replace( /\\([nrt])/g, function( sMatched, $1 ){ return {n:'\n',r:'\r',t:'\t'}[$1]}),
								'TEXT'
								)), e, nIndex, nTotal )
					break;
				case "MULTIPLICATION":
					var ni = e.oValue.value.slice( 1 )
					for(var i=0; i<ni; i++ ) addChild( eParent, e, i, ni )
					break;
				case "ATTRIBUTES":
					for(var eAttr = e.firstChild; eAttr; eAttr = eAttr.nextSibling )
						switch( eAttr.nodeName ){
							case "ELT": 	 eParent.addAttribute( rename( eAttr.oValue.value ), eAttr.lastChild.oValue ? rename( eAttr.lastChild.oValue.value ) : '' ); break;
							case "ELTCLASS": eParent.addAttribute( 'class', rename( eAttr.oValue.value.slice(1)), true ); break;
							case "ELTID": 	 eParent.addAttribute( 'id', rename( eAttr.oValue.value.slice(1))); break;
							}
					break;
				case "ARGUMENTS":
					for(var eArg = e.firstChild; eArg; eArg = eArg.nextSibling )
						switch( eArg.nodeName ){
							case "ELT": 
							case "STRING":
							case "NUMBER": 	eParent.addArgument( rename( eArg.oValue.value )); break;
							default: eParent.addArgument( '' ); break;
							}
					break;
				case "UP":
					nUp = e.oValue.value.length
					for(var i=0; i<nUp; i++ ) if( eParent.parentNode ) eParent = eParent.parentNode
					break;
				}
			}
		}
	var eResult = Tag('ROOT', '')
	addChild( eResult, eAST )
	var s = eResult.toString().replace(/^\t/gim, '' ).trim() // Efface les espace inutiles
	var nCaretPos
	if( ( nCaretPos = s.indexOf('|')) > -1 ) s = s.replace( /\|/g, '' )
	return {
		nIndex: nCaretPos>-1 ? nCaretPos : s.length,
		sText: s
		}
	}
