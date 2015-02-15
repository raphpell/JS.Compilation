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
h1 { color: red ;}
	</style>
</head>
<body>
	<h1><xsl:value-of select="@name"/></h1>
	<xsl:for-each select="syntax/note">
		<pre class="note"><xsl:value-of select="."/></pre>
	</xsl:for-each>
	<dl>
	<xsl:for-each select="group">
	<section><h2><xsl:value-of select="@name"/></h2>
		<dl>
		<xsl:for-each select="methods">
			<dt><xsl:value-of select="@name"/></dt>
			<dd>
				<dl>
				<xsl:for-each select="function">
					<dt><xsl:value-of select="@name"/></dt>
					<dd>
						<dl>
						<xsl:for-each select="arguments/arg">
							<dt><xsl:value-of select="@name"/></dt>
							<dd><xsl:value-of select="desc"/></dd>
						</xsl:for-each>
						</dl>
					</dd>
				</xsl:for-each>
				</dl>
			</dd>
		</xsl:for-each>
		</dl>
	</section>
	</xsl:for-each>
	</dl>

</body>
</html>
</xsl:template>
</xsl:transform>