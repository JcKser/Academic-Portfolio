//
// The following include files must come first.

#ifndef COOL_TREE_HANDCODE_H
#define COOL_TREE_HANDCODE_H

#include "cool-io.h"
#include "tree.h"
#include "cool.h"
#include "stringtab.h"
#define yylineno curr_lineno;
extern int yylineno;

inline Boolean copy_Boolean(Boolean b) {return b; }
inline void assert_Boolean(Boolean) {}
inline void dump_Boolean(ostream& stream, int padding, Boolean b)
	{ stream << pad(padding) << (int) b << "\n"; }

void dump_Symbol(ostream& stream, int padding, Symbol b);
void assert_Symbol(Symbol b);
Symbol copy_Symbol(Symbol b);

class Program_class;
typedef Program_class *Program;
class Class__class;
typedef Class__class *Class_;
class Feature_class;
typedef Feature_class *Feature;
class Formal_class;
typedef Formal_class *Formal;
class Expression_class;
typedef Expression_class *Expression;
class Case_class;
typedef Case_class *Case;

typedef list_node<Class_> Classes_class;
typedef Classes_class *Classes;
typedef list_node<Feature> Features_class;
typedef Features_class *Features;
typedef list_node<Formal> Formals_class;
typedef Formals_class *Formals;
typedef list_node<Expression> Expressions_class;
typedef Expressions_class *Expressions;
typedef list_node<Case> Cases_class;
typedef Cases_class *Cases;

#define Program_EXTRAS                          \
virtual void semant() = 0;			\
virtual void dump_with_types(ostream&, int) = 0; 



#define program_EXTRAS                          \
void semant();     				\
void dump_with_types(ostream&, int);            \
Classes get_classes() { return classes; }

#define Class__EXTRAS                   \
virtual Symbol get_filename() = 0;      \
virtual void dump_with_types(ostream&,int) = 0; 


#define class__EXTRAS                                 \
Symbol get_filename() { return filename; }             \
void dump_with_types(ostream&,int);                    \
Symbol get_name() { return name; }                     \
Symbol get_parent() { return parent; }                 \
Features get_features() { return features; }


#define Feature_EXTRAS                                        \
virtual void dump_with_types(ostream&,int) = 0; 


#define Feature_SHARED_EXTRAS                                       \
void dump_with_types(ostream&,int);    





#define Formal_EXTRAS                              \
virtual void dump_with_types(ostream&,int) = 0;


#define formal_EXTRAS                           \
void dump_with_types(ostream&,int);              \
Symbol get_name() { return name; }              \
Symbol get_type_decl() { return type_decl; }


#define Case_EXTRAS                             \
virtual void dump_with_types(ostream& ,int) = 0;


#define branch_EXTRAS                                   \
void dump_with_types(ostream& ,int);                     \
Symbol get_name() { return name; }                       \
Symbol get_type_decl() { return type_decl; }             \
Expression get_expr() { return expr; }


#define Expression_EXTRAS                    \
Symbol type;                                 \
Symbol get_type() { return type; }           \
Expression set_type(Symbol s) { type = s; return this; } \
virtual void dump_with_types(ostream&,int) = 0;  \
void dump_type(ostream&, int);               \
Expression_class() { type = (Symbol) NULL; }

#define Expression_SHARED_EXTRAS           \
void dump_with_types(ostream&,int); 

#define method_EXTRAS                                  \
Symbol get_name() { return name; }                     \
Formals get_formals() { return formals; }              \
Symbol get_return_type() { return return_type; }       \
Expression get_expr() { return expr; }

#define attr_EXTRAS                                   \
Symbol get_name() { return name; }                    \
Symbol get_type_decl() { return type_decl; }          \
Expression get_init() { return init; }

#define assign_EXTRAS                                 \
Symbol get_name() { return name; }                    \
Expression get_expr() { return expr; }

#define static_dispatch_EXTRAS                        \
Expression get_expr() { return expr; }               \
Symbol get_type_name() { return type_name; }          \
Symbol get_name() { return name; }                    \
Expressions get_actual() { return actual; }

#define dispatch_EXTRAS                               \
Expression get_expr() { return expr; }                \
Symbol get_name() { return name; }                     \
Expressions get_actual() { return actual; }

#define cond_EXTRAS                                   \
Expression get_pred() { return pred; }                \
Expression get_then_exp() { return then_exp; }        \
Expression get_else_exp() { return else_exp; }

#define loop_EXTRAS                                   \
Expression get_pred() { return pred; }                \
Expression get_body() { return body; }

#define typcase_EXTRAS                                \
Expression get_expr() { return expr; }                \
Cases get_cases() { return cases; }

#define block_EXTRAS                                  \
Expressions get_body() { return body; }

#define let_EXTRAS                                    \
Symbol get_identifier() { return identifier; }        \
Symbol get_type_decl() { return type_decl; }           \
Expression get_init() { return init; }                 \
Expression get_body() { return body; }

#define binary_EXTRAS                                 \
Expression get_e1() { return e1; }                    \
Expression get_e2() { return e2; }

#define plus_EXTRAS binary_EXTRAS
#define sub_EXTRAS binary_EXTRAS
#define mul_EXTRAS binary_EXTRAS
#define divide_EXTRAS binary_EXTRAS
#define lt_EXTRAS binary_EXTRAS
#define eq_EXTRAS binary_EXTRAS
#define leq_EXTRAS binary_EXTRAS

#define unary_EXTRAS                                  \
Expression get_e1() { return e1; }

#define neg_EXTRAS unary_EXTRAS
#define comp_EXTRAS unary_EXTRAS
#define isvoid_EXTRAS unary_EXTRAS

#define int_const_EXTRAS                              \
Symbol get_token() { return token; }

#define bool_const_EXTRAS                             \
Boolean get_value() { return val; }

#define string_const_EXTRAS                           \
Symbol get_token() { return token; }

#define new__EXTRAS                                   \
Symbol get_type_name() { return type_name; }

#define object_EXTRAS                                 \
Symbol get_name() { return name; }

#endif
