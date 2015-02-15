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
.desc { margin: 0 0 1em 2em ;}
.arguments,
.returnValue { margin: 1em ;}
.arguments DL,
SECTION { margin-left: 1em ;}
	</style>
</head>
<body>
	<h1><xsl:value-of select="@name"/></h1>
	<div class="desc"><xsl:copy-of select="desc"/></div>
	<xsl:for-each select="syntax/note">
		<div class="note"><xsl:copy-of select="current()"/></div>
	</xsl:for-each>
	<dl>
	<xsl:for-each select="group">
	<section><h2><xsl:value-of select="@name"/></h2>

		<xsl:for-each select="methods">
			<section><h3><xsl:value-of select="@name"/></h3>
				<dl>
				<xsl:for-each select="function">
					<dt>
						<code><xsl:value-of select="@name"/>
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
						<div class="desc"><xsl:copy-of select="desc"/></div>
						<xsl:if test="arguments">
							<div class="arguments">
								<b>Argument(s)</b>
								<dl>
								<xsl:for-each select="arguments/arg">
									<dt><code><xsl:value-of select="@name"/></code></dt>
									<dd><xsl:copy-of select="desc"/></dd>
								</xsl:for-each>
								</dl>
							</div>
						</xsl:if>
						<xsl:if test="returnValue">
							<div class="returnValue">
								<b>Valeur retournée</b>
								<xsl:for-each select="returnValue/desc">
									<p><xsl:copy-of select="current()"/></p>
								</xsl:for-each>
							</div>
						</xsl:if>
					</dt>
				</xsl:for-each>
				</dl>
			</section>
		</xsl:for-each>

	</section>
	</xsl:for-each>
	</dl>

	<script>

	</script>
</body>
</html>
</xsl:template>
</xsl:transform>