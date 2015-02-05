Lexer et Parser JavaScript.
===========
[Site du projet](http://raphpell.github.io/JS.Compilation/index.htm) 

Objectif: Colorisation de code dans un éditeur de texte.


Lexers ( RE vs DFA )
--------
Comparaison d'un Lexer à expressions régulières et d'un lexer à automates finis déterministes :
- [Performance: scan](http://raphpell.github.io/JS.Compilation/Lexers.performance.scan.htm)
- [Performance: readToken](http://raphpell.github.io/JS.Compilation/Lexers.performance.readToken.htm)
- [Comparaison résultats](http://raphpell.github.io/JS.Compilation/Lexers.result.comparaison.htm)

Etude analyse lexicale incrémentielle :
- [Performance](http://raphpell.github.io/JS.Compilation/LexerAutomaton.incremental.htm)

Divers :
- [Créer un AFN et AFD depuis une expression régulière](http://raphpell.github.io/JS.Compilation/AFD.generator.htm)
- [Aggréger des automates finis déterministes](http://raphpell.github.io/JS.Compilation/AFD.aggregator.htm)
- [Créer des modules pour les lexers](http://raphpell.github.io/JS.Compilation/LexerAutomaton.module.generator.htm)


Parser
--------
- Compilation de grammaire
- [Créer des module sour le parser](http://raphpell.github.io/JS.Compilation/Parser.htm)
- [Parser LR : readToken](http://raphpell.github.io/JS.Compilation/Parser.byStep.htm)


En attente
--------
- L'analyse syntaxique incrémentielle

