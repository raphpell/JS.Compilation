Lexer et Parser en JavaScript.
===========
[Site du projet](http://raphpell.github.io/JS.Compilation/index.htm)
 / [Documentation](http://raphpell.github.io/JS.Compilation/xml/fr/doc/index.htm)

Lexers ( ER vs AFD )
--------
Comparaison de Lexer à expressions régulières (ER) et d'un lexer à automates finis déterministes (AFD) :
- [Comparaison du résultat](http://raphpell.github.io/JS.Compilation/Lexers.result.comparaison.htm)
- [Performance: scan](http://raphpell.github.io/JS.Compilation/Lexers.performance.scan.htm)
- [Performance: readToken](http://raphpell.github.io/JS.Compilation/Lexers.performance.readToken.htm)

Analyse lexicale incrémentielle pour éditeur de texte :
- [Performance](http://raphpell.github.io/JS.Compilation/Lexers.performance.scan.incremental.htm)

Pour les automates :
- [Transformation d'une ER en AFD](http://raphpell.github.io/JS.Compilation/AFD.generator.htm)
- [Aggrégation d'automates finis déterministes](http://raphpell.github.io/JS.Compilation/AFD.aggregator.htm)
- [Création de module pour les lexers](http://raphpell.github.io/JS.Compilation/LexerAutomaton.module.generator.htm)


Parser
--------
- [Compilation de grammaires LL, LR(0), SLR, LR(1)](http://raphpell.github.io/JS.Compilation/Parser.htm)
- [Parser LR : readToken](http://raphpell.github.io/JS.Compilation/Parser.byStep.htm)

L'analyse syntaxique incrémentielle semble trop difficile à réaliser pour le moment...

