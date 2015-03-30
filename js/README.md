## Framework
L'environnement JavaScript à été augmenté pour développer plus facilement le programme.
Fichier | Description
------ | -----------
framework.js | Code source requis partagé ... il contient du code devant figurer ailleur !

## Lexèmes
Les lexèmes sont stockés par défaut dans des éléments html.
Fichier | Description
------ | -----------
lexer.node.object.js | Premier objet utilisé pour remplacer les éléments HTML
lexer.node.simple.js | Objet le plus performant pour remplacer les éléments HTML

## Lexers
Les lexers sont construits depuis une même base.
Fichier | Description
------ | -----------
lexer.class.js | Base des lexers
lexer.automaton.js | Lexer à automates
lexer.automaton.modules.js | Extension du lexer à automates
lexer.regexp.multi.js | Lexer à plusieurs ER
lexer.regexp.multi.modules.js | Extension du lexer à plusieurs ER
lexer.regexp.one.js | Lexer à une ER
lexer.regexp.one.modules.js | Extension du lexer à une ER

## Parser
Seul le parser de grammaire LR est fonctionnel.
Fichier | Description
------ | -----------
parserLL.js | en construction...
parserLR.js | Parser de grammaire LR

## Les pages
Le code source utilisé pour générer des automates et des parser est ici...
Fichier | Description
------ | -----------
shared.js | Code source partagé par les pages
automaton.js | Création d'automates depuis des ER
regexp.examples.js | Exemples d'expression régulière
grammar.js | Création de parser
grammar.examples.js | Exemples de grammaire
