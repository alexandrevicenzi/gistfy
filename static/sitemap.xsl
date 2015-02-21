<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>XML Sitemap</title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style type="text/css">
                    body {
                        font-family:"Lucida Grande","Lucida Sans Unicode",Tahoma,Verdana;
                        font-size: 13px;
                    }

                    #header {
                        text-align: center;
                        padding-top: 14px;
                        padding-bottom: 29px;
                    }

                    h1 {
                        font-weight: normal;
                        font-size: 24px;
                        line-height: 20px;
                        color: #333333;
                    }

                    h2 {
                        font-weight: normal;
                        font-size: 13px;
                        color: #aaaaaa;
                        line-height: 10px;
                    }

                    #content {
                        background: #f8f8f8;
                        border-top: 1px solid #dddddd;
                        padding-top: 50px;
                    }

                    #content a:visited,
                    #content tr:hover a:visited {
                        color: #68009c;
                    }

                    table {
                        margin: 0 auto;
                        text-align: left;
                    }

                    tr#table-header:hover {
                        background: none;
                    }

                    tr:hover {
                        background: #ebebeb;
                    }

                    #content tr:hover a {
                        color: #6e6e6e;
                    }

                    td {
                        color: #6e6e6e;
                        font-size: 12px;
                        border-bottom: 1px solid #dddddd;
                        padding: 11px 5px 13px;
                    }

                    th {
                        color: #333333;
                        font-size: 12px;
                        border-bottom: 1px solid #dddddd;
                        padding: 5px 50px 17px 5px;
                    }

                    #footer {
                        background: #f8f8f8;
                        font-size: 13px;
                        color: #aaaaaa;
                        padding: 54px 0 20px;
                        text-align: center;
                    }

                    a {
                        color: #2384c6;
                    }

                    a:hover {
                        color: #6e6e6e;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div id="header">
                    <h1>XML Sitemap</h1>
                    <h2>This is a XML Sitemap which is supposed to be processed by <a href="http://www.google.com">Google search engine</a>.</h2>
                </div>
                <div id="content">
                    <table cellpadding="5" cellspacing="0">
                        <tr id="table-header">
                            <th>URL</th>
                            <th>Priority</th>
                            <th>Change Frequency</th>
                            <th>LastChange (GMT)</th>
                        </tr>
                        <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
                        <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
                        <xsl:for-each select="sitemap:urlset/sitemap:url">
                            <tr>
                                <xsl:if test="position() mod 2 != 1">
                                    <xsl:attribute  name="class">high</xsl:attribute>
                                </xsl:if>
                                <td>
                                    <xsl:variable name="itemURL">
                                        <xsl:value-of select="sitemap:loc"/>
                                    </xsl:variable>
                                    <a href="{$itemURL}">
                                        <xsl:value-of select="sitemap:loc"/>
                                    </a>
                                </td>
                                <td>
                                    <xsl:value-of select="concat(sitemap:priority*100,'%')"/>
                                </td>
                                <td>
                                    <xsl:value-of select="concat(translate(substring(sitemap:changefreq, 1, 1),concat($lower, $upper),concat($upper, $lower)),substring(sitemap:changefreq, 2))"/>
                                </td>
                                <td>
                                    <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
                                </td>
                            </tr>
                        </xsl:for-each>
                    </table>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
