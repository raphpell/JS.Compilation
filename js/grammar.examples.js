var aExamples =[
	 [	'',
		'',
		'',
		'LL1']
	,[	'-- Grammaire LL(1) --',
		'',
		'',
		'LL1']
	,[	'1. LL(1) & SLR',
		' E -> T X \n X -> + E | epsilon \n T -> int Y | ( E ) Y \n Y -> * T | epsilon',
		['( int + int ) * int','int * ( int + int )'],
		'LL1']
	,[	'',
		'',
		'',
		'LL1']
	,[	'-- Conflits LL(1) --',
		'',
		'',
		'LL1']
	,[	"1. FIRST/FIRST : SLR",
		' S → E | E a \n E → b | epsilon ',
		'b a',
		'LL1']
	,[	'1.1. ...(merging into a single non-terminal) : SLR',
		'S → b | epsilon | b a | a',
		'b a',
		'LL1']
	,[	'1.2. ...solution (left-factoring) : LL(1) & SLR',
		' S → b E | E \n E → a | epsilon ',
		'b a',
		'LL1']
	,[	'2. FIRST/FIRST : left recursion. LR(0)',
		' E → E + T | T ',
		'T + T + T',
		'LL1']
	,[	'2.1. ...solution : LL(1) & SLR',
		' E → T Z \n Z → + T Z | epsilon ',
		'T + T + T',
		'LL1']
	,[	'3. FIRST/FIRST : left recursion. LR(0)',
		' E → E + T | alt1 | alt2 ',
		'alt1',
		'LL1']
	,[	'3.1. ...solution : LL(1) & SLR',
		' E → alt1 Z | alt2 Z \n Z → + T Z | epsilon ',
		'alt2 + T + T',
		'LL1']
	,[	'4. FIRST/FOLLOW',
		' S → A a b \n A → a | epsilon ',
		['a b','a a b'],
		'LL1']
	,[	'4.1. ...solution : réécriture LR(0)',
		' S → a a b | a b ',
		['a b','a a b'],
		'LR0']
	,[	'',
		'',
		'',
		'LR0']
	,[	'-- Grammaire LR(0)... SLR, LALR(1) et LR(1) --',
		'',
		'',
		'LR0']
	,[	'- 1. LR(0)',
		' E → E + T | T \n T → ( E ) | id',
		['id + id','id','( ( id ) + id )'],
		'LR0']
	,[	'- 2. LR(0)',
		' E → E * B | E + B | B \n B → 0 | 1 ',
		['1 * 1 + 1 * 1','0 + 1 * 1 * 0'],
		'LR0']
	,[	'',
		'',
		'',
		'SLR']
	,[	'-- Grammaire SLR ( non-LR(0) : conflit shift-reduce ) --',
		'',
		'',
		'SLR']
	,[	'- 1. SLR',
		'Z → S \nS → S a | a',
		['a a a','a'],
		'SLR']
	,[	'- 2. SLR',
		'E → E + T | T \nT → T * F | F \nF → ( E ) | id',
		['id * id + id','id * ( id + id )'],
		'SLR']
	,[	'- 3. SLR',
		'S → ( S ) S | epsilon',
		['( ( ) ) ( )','( )','( ) ( ( ( ) ) )'],
		'SLR']
	,[	'- 4. SLR',
		'E → 1 E \nE → 1 ',
		'1 1',
		'SLR']
	,[	'',
		'',
		'',
		'LR1']
	,[	'-- Grammaire LR(1) ( non-SLR : conflit reduce-reduce ) --',
		'',
		'',
		'LR1']
	,[	'- 1. LR(1)',
		' E → A 1 | B 2 \n A → 1 \n B → 1 ',
		[ '1 2', '1 1' ],
		'LR1']
	,[	'- 2. LR(1)',
		'S → id | V := E \nV → id \nE → V | n',
		[ 'id := n', 'id', 'id := id' ],
		'LR1']
	,[	'',
		'',
		'',
		'LR1']
	,[	'-- Observation(s) --',
		'',
		'',
		'LR1']
	,[	'analyse_syntaxique.pdf : LL(1) et non SLR(1) ??? LR(1) et non LL(1) !',
		' Z → S \n S → A a A b | B b B a \n A → epsilon \n B → epsilon',
		['b a','a b'],
		'LR1']
	,[	'analyse_syntaxique.pdf : LL(1) et non LALR(1) ??? LR(1) et non LL(1) !',
		'Z → S \nS → a F | b G \nF → X c | Y d \nG → X d | Y c \nX → I A \nI → epsilon \nY → I B\nA → epsilon \nB → epsilon ',
		['a d','a c'],
		'LR1']
	,[	'analyse_syntaxique.pdf : LALR(1) et non SLR ??? LR(1)?',
		' Z → S \n S → A a | b A c | d c | b d a \n A → d',
		['d a','b d c','d c','b d a'],
		'LR1']
	,[	'LR(1) et non LALR(1) ???',
		' Z → S \n S → A a | b A c | B c | b B a \n A → d \n B → d',
		['d a','b d c','d c','b d a'],
		'LR1']
	,[	'',
		'',
		'',
		'SLR']
	,[	'-- Exemple(s) concret(s) --',
		'',
		'',
		'SLR']
	,[	'RegExp Grammar (SLR)',
		[
			"REGEXP		→ UNION | epsilon",
			"UNION		→ CONCAT '|' UNION | CONCAT",
			"CONCAT		→ REPEAT CONCAT | REPEAT",
			"REPEAT		→ REPEAT ? | REPEAT * | REPEAT + | REPEAT {n} | REPEAT {n,} | REPEAT {n,m} | CHAR_CLASS_EXP",
			"CHAR_CLASS_EXP	→ [ CHAR_CLASSES ] | [^ CHAR_CLASSES ] | SIMPLE_EXP",
			"CHAR_CLASSES	→ CHAR_CLASS CHAR_CLASSES | CHAR_CLASS",
			"CHAR_CLASS	→ CHAR - CHAR | CHAR",
			"SIMPLE_EXP	→ CHAR | ANY | ( ) | ( UNION )",
			"CHAR		→ c | \\ c"
			].join('\n'),
		"c ( [ c - c ] ? c '|' ( c '|' c ) + ) *",
		'SLR']
	,[	'ZenLike Grammar (SLR)',
		[
			"ZEN	→	INSTRUCTION | REPEAT",
			"INSTRUCTION	→	REPEAT GTHAN ZEN | REPEAT PLUS ZEN | REPEAT UP ZEN",
			"REPEAT	→	GROUPING MULTIPLICATION | GROUPING",
			"GROUPING	→	ELT | ELT DEFINITION | ELT DEFINITION STRING | ELT STRING | STRING | LPAREN RPAREN | LPAREN ZEN RPAREN",
			"DEFINITION	→	ARGS ATTRS | ARGS | ATTRS | ATTRS ARGS",
			"ARGS	→	ARGS ARGUMENT_PREFIX VALUE | ARGUMENT_PREFIX VALUE",
			"ATTRS	→	ATTRS ATTR | ATTR",
			"ATTR	→	ELTID | ELTCLASS | LBRACK CATTRS RBRACK",
			"CATTRS	→	CATTRS CATTR | CATTR",
			"CATTR	→	ELT EQUAL VALUE | ELT",
			"VALUE	→	ELT | STRING | NUMBER"
			].join('\n'),
		"ELT ELTCLASS GTHAN ELT PLUS ELT MULTIPLICATION",
		'SLR']
]