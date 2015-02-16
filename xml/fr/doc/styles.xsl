<?xml version="1.0" encoding="UTF-8"?>
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
<xsl:output method="html" 
    doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
    doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" />

<xsl:template match="class">
<html>
<head>
	<title><xsl:value-of select="@name"/></title>
	<style>
.desc { margin: .5em 1em ;}
.arguments,
.syntaxe,
.returnValue { margin: .5em 1em ;}
DL,
SECTION { margin-left: 1em ;}
H2, H3 { margin: 0; }
CODE {	
	background: #000;
	color: yellow;
	padding: 0 .5em;
	}
.arguments-inline,
.type {
	background: #FFF;
	color: green;
	margin: 0 .5em;
	padding: 0;
	}
LABEL { cursor: pointer; display:block; }
INPUT[type=checkbox] { float: left; display: none; }
INPUT ~ DL,
INPUT ~ DIV {
	height: 0px;
	overflow: hidden;
	}
INPUT:checked ~ DL,
INPUT:checked ~ DIV {
	height: auto;
	}
.menu {
	float: right;
	}
	</style>
</head>
<body>
	<div class="menu">
		<input type="button" id="eShowAll" value="Tout voir" />
		<input type="button" id="eHideAll" value="Tout cacher" />
	</div>

	<h1><xsl:value-of select="@name"/></h1>
	<div class="desc"><xsl:copy-of select="desc"/></div>

	<xsl:for-each select="syntax">
		<xsl:if test="code">
		<div class="syntaxe">
			<b>Syntaxe</b>
			<pre><xsl:value-of select="code"/></pre>
			<xsl:if test="arguments">
			<div class="arguments">
				<label for="_args{generate-id(@name)}"><b>Argument(s)</b></label>
				<dl>
					<xsl:for-each select="arguments/arg">
					<dt>
						<input type="checkbox" id="{generate-id(@name)}" />
						<label for="{generate-id(@name)}">
							<code><xsl:value-of select="@name"/></code>
							<xsl:text> </xsl:text>
							<code class="type"><xsl:value-of select="@type"/></code>
							<xsl:text> </xsl:text>
							<xsl:if test="@opt"><small>(optionnel)</small></xsl:if>
						</label>
						<div><xsl:copy-of select="desc"/></div>
					</dt>
					</xsl:for-each>
				</dl>
			</div>
			</xsl:if>
		</div>
		</xsl:if>
		<xsl:for-each select="note">
			<div class="note"><xsl:copy-of select="current()"/></div>
		</xsl:for-each>
	</xsl:for-each>

	<xsl:for-each select="group">
	<section><h2><xsl:value-of select="@name"/></h2>
		<div class="desc"><xsl:copy-of select="desc"/></div>
		<xsl:for-each select="methods|properties">
			<section><h3><xsl:value-of select="@name"/></h3>
				<div class="desc"><xsl:copy-of select="desc"/></div>
				<dl>
				<xsl:for-each select="variable">
					<dt>
						<input type="checkbox" id="{generate-id(@name)}" />
						<label for="{generate-id(@name)}">
							<code><xsl:value-of select="@name"/></code>
							<code class="type"><xsl:value-of select="@type"/></code>
						</label>
						<div>
							<div class="desc"><xsl:copy-of select="desc"/></div>
						</div>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="function">
					<dt>
						<input type="checkbox" id="{generate-id(@name)}" />
						<label for="{generate-id(@name)}">
							<code><xsl:value-of select="@name"/></code>
							<code class="arguments-inline">
								(<xsl:text> </xsl:text>
								<xsl:for-each select="arguments/arg">
									<xsl:if test="@opt"> [</xsl:if>
									<xsl:if test="position()>1">, </xsl:if>
									<xsl:value-of select="@name"/>
								</xsl:for-each>
								<xsl:text> </xsl:text>
								<xsl:for-each select="arguments/arg">
									<xsl:if test="@opt">]</xsl:if>
								</xsl:for-each>)
							</code>
						</label>
						<div>
							<div class="desc"><xsl:copy-of select="desc"/></div>
							<xsl:if test="arguments">
							<div class="arguments">
								<!-- <input type="checkbox" id="_args{generate-id(@name)}" /> -->
								<label for="_args{generate-id(@name)}"><b>Argument(s)</b></label>
								<dl>
									<xsl:for-each select="arguments/arg">
									<dt>
										<input type="checkbox" id="{generate-id(@name)}" />
										<label for="{generate-id(@name)}">
											<code><xsl:value-of select="@name"/></code>
											<xsl:text> </xsl:text>
											<code class="type"><xsl:value-of select="@type"/></code>
											<xsl:text> </xsl:text>
											<xsl:if test="@opt"><small>(optionnel)</small></xsl:if>
										</label>
										<div><xsl:copy-of select="desc"/></div>
									</dt>
									</xsl:for-each>
								</dl>
							</div>
							</xsl:if>
							<xsl:if test="returnValue">
							<div class="returnValue">
								<b>Valeur retournée</b>
								<xsl:text> </xsl:text>
								<code class="type"><xsl:value-of select="returnValue/@type"/></code>
								<xsl:for-each select="returnValue/desc">
									<p><xsl:copy-of select="current()"/></p>
								</xsl:for-each>
							</div>
							</xsl:if>
						</div>
					</dt>
				</xsl:for-each>
				</dl>
			</section>
		</xsl:for-each>
	</section>
	</xsl:for-each>

	<script>
addEvent =function( sId, sEvent, fFunction ){
	document.getElementById( sId )[ 'on'+ sEvent ] = fFunction
	}	
addEvent( "eShowAll", "click", function(){
	var a = document.getElementsByTagName( 'INPUT' )
	for(var i=0; a[i]; i++ )
		if( a[i].type=='checkbox' )
			a[i].checked = true
	})
addEvent( "eHideAll", "click", function(){
	var a = document.getElementsByTagName( 'INPUT' )
	for(var i=0; a[i]; i++ )
		if( a[i].type=='checkbox' )
			a[i].checked = false
	})

	</script>
</body>
</html>
</xsl:template>
</xsl:transform>