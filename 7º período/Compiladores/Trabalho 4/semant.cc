

#include <stdlib.h>
#include <stdio.h>
#include <stdarg.h>
#include "semant.h"
#include "utilities.h"


extern int semant_debug;
extern char *curr_filename;

//////////////////////////////////////////////////////////////////////
//
// Symbols
//
// For convenience, a large number of symbols are predefined here.
// These symbols include the primitive type and method names, as well
// as fixed names used by the runtime system.
//
//////////////////////////////////////////////////////////////////////
static Symbol 
    arg,
    arg2,
    Bool,
    concat,
    cool_abort,
    copy_meth,
    Int,
    in_int,
    in_string,
    IO,
    length,
    Main,
    main_meth,
    No_class,
    No_type,
    Object,
    out_int,
    out_string,
    prim_slot,
    self,
    SELF_TYPE,
    Str,
    str_field,
    substr,
    type_name,
    val;
//
// Initializing the predefined symbols.
//
static void initialize_constants(void)
{
    arg         = idtable.add_string("arg");
    arg2        = idtable.add_string("arg2");
    Bool        = idtable.add_string("Bool");
    concat      = idtable.add_string("concat");
    cool_abort  = idtable.add_string("abort");
    copy_meth  = idtable.add_string("copy");
    Int         = idtable.add_string("Int");
    in_int      = idtable.add_string("in_int");
    in_string   = idtable.add_string("in_string");
    IO          = idtable.add_string("IO");
    length      = idtable.add_string("length");
    Main        = idtable.add_string("Main");
    main_meth   = idtable.add_string("main");
    //   _no_class is a symbol that can't be the name of any 
    //   user-defined class.
    No_class    = idtable.add_string("_no_class");
    No_type     = idtable.add_string("_no_type");
    Object      = idtable.add_string("Object");
    out_int     = idtable.add_string("out_int");
    out_string  = idtable.add_string("out_string");
    prim_slot   = idtable.add_string("_prim_slot");
    self        = idtable.add_string("self");
    SELF_TYPE   = idtable.add_string("SELF_TYPE");
    Str         = idtable.add_string("String");
    str_field   = idtable.add_string("_str_field");
    substr      = idtable.add_string("substr");
    type_name   = idtable.add_string("type_name");
    val         = idtable.add_string("_val");
}



ClassTable::ClassTable(Classes classes) : semant_errors(0) , error_stream(cerr) {
    install_basic_classes();
    for (int i = classes->first(); classes->more(i); i = classes->next(i))
        add_class(classes->nth(i));
    validate_inheritance();
    for (int i = classes->first(); classes->more(i); i = classes->next(i))
        validate_class_features(classes->nth(i));
}

void ClassTable::install_basic_classes() {

    // The tree package uses these globals to annotate the classes built below.
    curr_lineno  = 0;
    Symbol filename = stringtable.add_string("<basic class>");
    
    // The following demonstrates how to create dummy parse trees to
    // refer to basic Cool classes.  There's no need for method
    // bodies -- these are already built into the runtime system.
    
    // IMPORTANT: The results of the following expressions are
    // stored in local variables.  You will want to do something
    // with those variables at the end of this method to make this
    // code meaningful.

    // 
    // The Object class has no parent class. Its methods are
    //        abort() : Object    aborts the program
    //        type_name() : Str   returns a string representation of class name
    //        copy() : SELF_TYPE  returns a copy of the object
    //
    // There is no need for method bodies in the basic classes---these
    // are already built in to the runtime system.

    Class_ Object_class =
	class_(Object, 
	       No_class,
	       append_Features(
			       append_Features(
				       single_Features(::method(cool_abort, nil_Formals(), Object, no_expr())),
				       single_Features(::method(type_name, nil_Formals(), Str, no_expr()))),
			       single_Features(::method(copy_meth, nil_Formals(), SELF_TYPE, no_expr()))),
	       filename);

    // 
    // The IO class inherits from Object. Its methods are
    //        out_string(Str) : SELF_TYPE       writes a string to the output
    //        out_int(Int) : SELF_TYPE            "    an int    "  "     "
    //        in_string() : Str                 reads a string from the input
    //        in_int() : Int                      "   an int     "  "     "
    //
    Class_ IO_class = 
	class_(IO, 
	       Object,
	       append_Features(
			       append_Features(
					       append_Features(
						       		       single_Features(::method(out_string, single_Formals(formal(arg, Str)),
										      SELF_TYPE, no_expr())),
						       	       single_Features(::method(out_int, single_Formals(formal(arg, Int)),
										      SELF_TYPE, no_expr()))),
						       single_Features(::method(in_string, nil_Formals(), Str, no_expr()))),
			       single_Features(::method(in_int, nil_Formals(), Int, no_expr()))),
	       filename);  

    //
    // The Int class has no methods and only a single attribute, the
    // "val" for the integer. 
    //
    Class_ Int_class =
	class_(Int, 
	       Object,
	       single_Features(attr(val, prim_slot, no_expr())),
	       filename);

    //
    // Bool also has only the "val" slot.
    //
    Class_ Bool_class =
	class_(Bool, Object, single_Features(attr(val, prim_slot, no_expr())),filename);

    //
    // The class Str has a number of slots and operations:
    //       val                                  the length of the string
    //       str_field                            the string itself
    //       length() : Int                       returns length of the string
    //       concat(arg: Str) : Str               performs string concatenation
    //       substr(arg: Int, arg2: Int): Str     substring selection
    //       
    Class_ Str_class =
	class_(Str, 
	       Object,
	       append_Features(
			       append_Features(
					       append_Features(
							       append_Features(
									       single_Features(attr(val, Int, no_expr())),
									       single_Features(attr(str_field, prim_slot, no_expr()))),
						       single_Features(::method(length, nil_Formals(), Int, no_expr()))),
						       single_Features(::method(concat, 
								      single_Formals(formal(arg, Str)),
								      Str, 
								      no_expr()))),
				       single_Features(::method(substr, 
						      append_Formals(single_Formals(formal(arg, Int)), 
								     single_Formals(formal(arg2, Int))),
						      Str, 
						      no_expr()))),
	       filename);

    add_class(Object_class);
    add_class(IO_class);
    add_class(Int_class);
    add_class(Bool_class);
    add_class(Str_class);
}

////////////////////////////////////////////////////////////////////
//
// semant_error is an overloaded function for reporting errors
// during semantic analysis.  There are three versions:
//
//    ostream& ClassTable::semant_error()                
//
//    ostream& ClassTable::semant_error(Class_ c)
//       print line number and filename for `c'
//
//    ostream& ClassTable::semant_error(Symbol filename, tree_node *t)  
//       print a line number and filename
//
///////////////////////////////////////////////////////////////////

ostream& ClassTable::semant_error(Class_ c)
{                                                             
    return semant_error(c->get_filename(),c);
}    

ostream& ClassTable::semant_error(Symbol filename, tree_node *t)
{
    error_stream << filename << ":" << t->get_line_number() << ": ";
    return semant_error();
}

ostream& ClassTable::semant_error()                  
{                                                 
    semant_errors++;                            
    return error_stream;
} 

bool ClassTable::is_basic(Symbol s)
{
    return s == Object || s == IO || s == Int || s == Bool || s == Str;
}

void ClassTable::add_class(Class_ c)
{
    class__class *cc = dynamic_cast<class__class *>(c);
    Symbol name = cc->get_name();
    if (name == SELF_TYPE) {
        semant_error(c) << "SELF_TYPE cannot be used as a class name." << endl;
        return;
    }
    if (class_map.find(name) != class_map.end()) {
        semant_error(c) << "Class " << name << " was previously defined." << endl;
        return;
    }
    ClassInfo ci;
    ci.node = c;
    ci.parent = cc->get_parent();
    Features_class *features = cc->get_features();
    for (int i = features->first(); features->more(i); i = features->next(i)) {
        Feature feature = features->nth(i);
        if (method_class *m = dynamic_cast<method_class *>(feature)) {
            MethodInfo mi;
            mi.return_type = m->get_return_type();
            Formals_class *formals = m->get_formals();
            for (int j = formals->first(); formals->more(j); j = formals->next(j)) {
                formal_class *fm = dynamic_cast<formal_class *>(formals->nth(j));
                mi.formal_names.push_back(fm->get_name());
                mi.formal_types.push_back(fm->get_type_decl());
            }
            ci.methods[m->get_name()] = mi;
        } else if (attr_class *a = dynamic_cast<attr_class *>(feature)) {
            ci.attributes[a->get_name()] = a->get_type_decl();
        }
    }
    class_map[name] = ci;
}

bool ClassTable::has_class(Symbol s)
{
    return class_map.find(s) != class_map.end();
}

ClassInfo *ClassTable::info(Symbol s)
{
    std::map<Symbol, ClassInfo>::iterator it = class_map.find(s);
    return it == class_map.end() ? 0 : &it->second;
}

Symbol ClassTable::parent(Symbol s)
{
    ClassInfo *ci = info(s);
    return ci == 0 ? No_class : ci->parent;
}

bool ClassTable::type_defined(Symbol s)
{
    return s == SELF_TYPE || s == No_type || has_class(s);
}

bool ClassTable::method(Symbol start, Symbol name, MethodInfo& out)
{
    Symbol cur = start;
    while (cur != No_class && has_class(cur)) {
        ClassInfo *ci = info(cur);
        std::map<Symbol, MethodInfo>::iterator it = ci->methods.find(name);
        if (it != ci->methods.end()) { out = it->second; return true; }
        cur = ci->parent;
    }
    return false;
}

bool ClassTable::attribute(Symbol start, Symbol name, Symbol& out)
{
    Symbol cur = start;
    while (cur != No_class && has_class(cur)) {
        ClassInfo *ci = info(cur);
        std::map<Symbol, Symbol>::iterator it = ci->attributes.find(name);
        if (it != ci->attributes.end()) { out = it->second; return true; }
        cur = ci->parent;
    }
    return false;
}

bool ClassTable::conforms(Symbol child, Symbol ancestor, Symbol current)
{
    if (child == No_type) return true;
    if (ancestor == SELF_TYPE)
        return child == SELF_TYPE;
    if (child == SELF_TYPE) child = current;
    Symbol cur = child;
    while (cur != No_class && has_class(cur)) {
        if (cur == ancestor) return true;
        cur = parent(cur);
    }
    return false;
}

Symbol ClassTable::lub(Symbol a, Symbol b, Symbol current)
{
    if (a == No_type) return b;
    if (b == No_type) return a;
    if (a == SELF_TYPE && b == SELF_TYPE) return SELF_TYPE;
    if (a == SELF_TYPE) a = current;
    if (b == SELF_TYPE) b = current;
    std::set<Symbol> ancestors;
    Symbol cur = a;
    while (cur != No_class && has_class(cur)) { ancestors.insert(cur); cur = parent(cur); }
    cur = b;
    while (cur != No_class && has_class(cur)) {
        if (ancestors.find(cur) != ancestors.end()) return cur;
        cur = parent(cur);
    }
    return Object;
}

void ClassTable::validate_inheritance()
{
    for (std::map<Symbol, ClassInfo>::iterator it = class_map.begin(); it != class_map.end(); ++it) {
        Symbol name = it->first;
        Symbol p = it->second.parent;
        if (name == Object) continue;
        if (!has_class(p)) {
            semant_error(it->second.node) << "Class " << name << " inherits from undefined class " << p << "." << endl;
            continue;
        }
        if (p == Int || p == Bool || p == Str || p == SELF_TYPE) {
            semant_error(it->second.node) << "Class " << name << " cannot inherit from " << p << "." << endl;
        }
        std::set<Symbol> seen;
        Symbol cur = name;
        while (cur != No_class && has_class(cur)) {
            if (seen.find(cur) != seen.end()) {
                semant_error(it->second.node) << "Inheritance cycle involving class " << name << "." << endl;
                break;
            }
            seen.insert(cur);
            cur = parent(cur);
        }
    }
    if (!has_class(Main))
        semant_error() << "Class Main is not defined." << endl;
}

void ClassTable::validate_class_features(Class_ c)
{
    class__class *cc = dynamic_cast<class__class *>(c);
    ClassInfo *ci = info(cc->get_name());
    if (ci == 0) return;
    std::set<Symbol> own_methods;
    std::set<Symbol> own_attributes;
    Features_class *features = cc->get_features();
    for (int i = features->first(); features->more(i); i = features->next(i)) {
        Feature f = features->nth(i);
        if (method_class *m = dynamic_cast<method_class *>(f)) {
            MethodInfo mi;
            mi.return_type = m->get_return_type();
            std::set<Symbol> formal_names;
            Formals_class *formals = m->get_formals();
            for (int j = formals->first(); formals->more(j); j = formals->next(j)) {
                formal_class *fm = dynamic_cast<formal_class *>(formals->nth(j));
                if (fm->get_name() == self)
                    semant_error(c) << "\"self\" cannot be used as a formal parameter." << endl;
                if (!formal_names.insert(fm->get_name()).second)
                    semant_error(c) << "Formal parameter " << fm->get_name() << " is multiply defined." << endl;
                if (!type_defined(fm->get_type_decl()))
                    semant_error(c) << "Formal parameter has undefined type " << fm->get_type_decl() << "." << endl;
                if (fm->get_type_decl() == SELF_TYPE)
                    semant_error(c) << "SELF_TYPE cannot be used as a formal parameter type." << endl;
                mi.formal_names.push_back(fm->get_name());
                mi.formal_types.push_back(fm->get_type_decl());
            }
            if (!type_defined(mi.return_type))
                semant_error(c) << "Method " << m->get_name() << " has undefined return type " << mi.return_type << "." << endl;
            if (!own_methods.insert(m->get_name()).second)
                semant_error(c) << "Method " << m->get_name() << " is multiply defined." << endl;
            MethodInfo inherited;
            if (method(ci->parent, m->get_name(), inherited)) {
                if (inherited.return_type != mi.return_type || inherited.formal_types != mi.formal_types)
                    semant_error(c) << "In redefined method " << m->get_name() << ", signature does not match inherited method." << endl;
            }
            ci->methods[m->get_name()] = mi;
        } else if (attr_class *a = dynamic_cast<attr_class *>(f)) {
            if (a->get_name() == self)
                semant_error(c) << "\"self\" cannot be the name of an attribute." << endl;
            if (!type_defined(a->get_type_decl()))
                semant_error(c) << "Attribute " << a->get_name() << " has undefined type " << a->get_type_decl() << "." << endl;
            if (!own_attributes.insert(a->get_name()).second)
                semant_error(c) << "Attribute " << a->get_name() << " is multiply defined." << endl;
            Symbol inherited_type;
            if (attribute(ci->parent, a->get_name(), inherited_type))
                semant_error(c) << "Attribute " << a->get_name() << " is an attribute of an inherited class." << endl;
            ci->attributes[a->get_name()] = a->get_type_decl();
        }
    }
    if (cc->get_name() == Main) {
        MethodInfo main_info;
        if (!method(Main, main_meth, main_info))
            semant_error(c) << "No method main in class Main." << endl;
        else if (!main_info.formal_types.empty())
            semant_error(c) << "Method main in class Main should have no arguments." << endl;
    }
}

static Symbol typed(Expression e, Symbol t)
{
    e->set_type(t);
    return t;
}

void TypeChecker::error(Expression e, const std::string& message)
{
    table->semant_error(current_class->get_filename(), e) << message << endl;
}

Symbol TypeChecker::resolve_self_type(Symbol type)
{
    return type == SELF_TYPE ? dynamic_cast<class__class *>(current_class)->get_name() : type;
}

void TypeChecker::install_features(Class_ c)
{
    class__class *cc = dynamic_cast<class__class *>(c);
    Symbol p = cc->get_parent();
    if (p != No_class && table->has_class(p)) install_features(table->info(p)->node);
    Features_class *features = cc->get_features();
    for (int i = features->first(); features->more(i); i = features->next(i)) {
        attr_class *a = dynamic_cast<attr_class *>(features->nth(i));
        if (a != 0) objects.add(a->get_name(), a->get_type_decl());
    }
}

bool TypeChecker::check_actuals(Expressions actual, const MethodInfo& method,
                                Expression where)
{
    int count = 0;
    for (int i = actual->first(); actual->more(i); i = actual->next(i), ++count) {
        Symbol actual_type = check(actual->nth(i));
        if (count >= (int)method.formal_types.size()) {
            error(where, "Method called with wrong number of arguments.");
        } else if (!table->conforms(actual_type, method.formal_types[count],
                                    dynamic_cast<class__class *>(current_class)->get_name())) {
            error(where, "In call, type " + std::string(actual_type->get_string()) +
                  " does not conform to declared type " +
                  std::string(method.formal_types[count]->get_string()) + ".");
        }
    }
    if (count != (int)method.formal_types.size()) {
        error(where, "Method called with wrong number of arguments.");
        return false;
    }
    return true;
}

Symbol TypeChecker::check(Expression e)
{
    Symbol current_name = dynamic_cast<class__class *>(current_class)->get_name();
    if (no_expr_class *n = dynamic_cast<no_expr_class *>(e)) return typed(e, No_type);
    if (int_const_class *i = dynamic_cast<int_const_class *>(e)) return typed(e, Int);
    if (bool_const_class *b = dynamic_cast<bool_const_class *>(e)) return typed(e, Bool);
    if (string_const_class *s = dynamic_cast<string_const_class *>(e)) return typed(e, Str);
    if (object_class *o = dynamic_cast<object_class *>(e)) {
        if (o->get_name() == self) return typed(e, SELF_TYPE);
        Symbol t;
        if (objects.lookup(o->get_name(), t)) return typed(e, t);
        if (table->attribute(current_name, o->get_name(), t)) return typed(e, t);
        error(e, "Undeclared identifier " + std::string(o->get_name()->get_string()) + ".");
        return typed(e, Object);
    }
    if (assign_class *a = dynamic_cast<assign_class *>(e)) {
        Symbol rhs = check(a->get_expr());
        if (a->get_name() == self) error(e, "Cannot assign to self.");
        Symbol declared;
        if (!objects.lookup(a->get_name(), declared) && !table->attribute(current_name, a->get_name(), declared)) {
            error(e, "Assignment to undeclared identifier " + std::string(a->get_name()->get_string()) + ".");
        } else if (!table->conforms(rhs, declared, current_name)) {
            error(e, "Type " + std::string(rhs->get_string()) + " of assigned expression does not conform to declared type " + std::string(declared->get_string()) + ".");
        }
        return typed(e, rhs);
    }
    if (static_dispatch_class *d = dynamic_cast<static_dispatch_class *>(e)) {
        Symbol receiver = check(d->get_expr());
        Symbol target = d->get_type_name();
        if (!table->has_class(target)) error(e, "Static dispatch to undefined class " + std::string(target->get_string()) + ".");
        else if (!table->conforms(receiver, target, current_name)) error(e, "Expression type does not conform to declared static dispatch type.");
        MethodInfo mi;
        if (!table->method(target, d->get_name(), mi)) {
            error(e, "Dispatch to undefined method " + std::string(d->get_name()->get_string()) + ".");
            Expressions_class *actual = d->get_actual();
            for (int i=actual->first(); actual->more(i); i=actual->next(i)) check(actual->nth(i));
            return typed(e, Object);
        }
        check_actuals(d->get_actual(), mi, e);
        return typed(e, mi.return_type == SELF_TYPE ? receiver : mi.return_type);
    }
    if (dispatch_class *d = dynamic_cast<dispatch_class *>(e)) {
        Symbol receiver = check(d->get_expr());
        Symbol lookup_type = receiver == SELF_TYPE ? current_name : receiver;
        MethodInfo mi;
        if (!table->method(lookup_type, d->get_name(), mi)) {
            error(e, "Dispatch to undefined method " + std::string(d->get_name()->get_string()) + ".");
            Expressions_class *actual = d->get_actual();
            for (int i=actual->first(); actual->more(i); i=actual->next(i)) check(actual->nth(i));
            return typed(e, Object);
        }
        check_actuals(d->get_actual(), mi, e);
        return typed(e, mi.return_type == SELF_TYPE ? receiver : mi.return_type);
    }
    if (cond_class *c = dynamic_cast<cond_class *>(e)) {
        if (check(c->get_pred()) != Bool) error(e, "Predicate of if does not have type Bool.");
        return typed(e, table->lub(check(c->get_then_exp()), check(c->get_else_exp()), current_name));
    }
    if (loop_class *l = dynamic_cast<loop_class *>(e)) {
        if (check(l->get_pred()) != Bool) error(e, "Predicate of while does not have type Bool.");
        check(l->get_body());
        return typed(e, Object);
    }
    if (typcase_class *t = dynamic_cast<typcase_class *>(e)) {
        check(t->get_expr());
        std::set<Symbol> branch_types;
        Symbol result = No_type;
        Cases_class *case_list = t->get_cases();
        for (int i=case_list->first(); case_list->more(i); i=case_list->next(i)) {
            branch_class *b = dynamic_cast<branch_class *>(case_list->nth(i));
            if (b->get_type_decl() == SELF_TYPE) error(e, "SELF_TYPE cannot be used as a case branch type.");
            if (!table->type_defined(b->get_type_decl())) error(e, "Undefined type " + std::string(b->get_type_decl()->get_string()) + " in case branch.");
            if (!branch_types.insert(b->get_type_decl()).second) error(e, "Duplicate branch type " + std::string(b->get_type_decl()->get_string()) + ".");
            objects.enter(); objects.add(b->get_name(), b->get_type_decl());
            Symbol branch_result = check(b->get_expr());
            objects.exit();
            result = table->lub(result, branch_result, current_name);
        }
        return typed(e, result == No_type ? Object : result);
    }
    if (block_class *b = dynamic_cast<block_class *>(e)) {
        Symbol result = Object;
        Expressions_class *body = b->get_body();
        for (int i=body->first(); body->more(i); i=body->next(i)) result = check(body->nth(i));
        return typed(e, result);
    }
    if (let_class *l = dynamic_cast<let_class *>(e)) {
        Symbol init_type = check(l->get_init());
        if (l->get_identifier() == self) error(e, "\"self\" cannot be bound in a let expression.");
        if (!table->type_defined(l->get_type_decl())) error(e, "Let variable has undefined type.");
        else if (!table->conforms(init_type, l->get_type_decl(), current_name)) error(e, "Inferred type does not conform to declared let type.");
        objects.enter(); objects.add(l->get_identifier(), l->get_type_decl());
        Symbol result = check(l->get_body()); objects.exit();
        return typed(e, result);
    }
    if (plus_class *b = dynamic_cast<plus_class *>(e)) {
        Symbol a=check(b->get_e1()), c=check(b->get_e2()); if(a!=Int||c!=Int) error(e,"Non-Int arguments to +."); return typed(e,Int);
    }
    if (sub_class *b = dynamic_cast<sub_class *>(e)) {
        Symbol a=check(b->get_e1()), c=check(b->get_e2()); if(a!=Int||c!=Int) error(e,"Non-Int arguments to -."); return typed(e,Int);
    }
    if (mul_class *b = dynamic_cast<mul_class *>(e)) {
        Symbol a=check(b->get_e1()), c=check(b->get_e2()); if(a!=Int||c!=Int) error(e,"Non-Int arguments to *."); return typed(e,Int);
    }
    if (divide_class *b = dynamic_cast<divide_class *>(e)) {
        Symbol a=check(b->get_e1()), c=check(b->get_e2()); if(a!=Int||c!=Int) error(e,"Non-Int arguments to /."); return typed(e,Int);
    }
    if (neg_class *u = dynamic_cast<neg_class *>(e)) { if(check(u->get_e1())!=Int) error(e,"Argument of ~ has type other than Int."); return typed(e,Int); }
    if (lt_class *b = dynamic_cast<lt_class *>(e)) { if(check(b->get_e1())!=Int||check(b->get_e2())!=Int) error(e,"Non-Int arguments to <."); return typed(e,Bool); }
    if (leq_class *b = dynamic_cast<leq_class *>(e)) { if(check(b->get_e1())!=Int||check(b->get_e2())!=Int) error(e,"Non-Int arguments to <=."); return typed(e,Bool); }
    if (eq_class *b = dynamic_cast<eq_class *>(e)) {
        Symbol a=check(b->get_e1()), c=check(b->get_e2());
        if ((a==Int||a==Bool||a==Str) && a!=c) error(e,"Illegal comparison with a basic type.");
        return typed(e,Bool);
    }
    if (comp_class *u = dynamic_cast<comp_class *>(e)) { if(check(u->get_e1())!=Bool) error(e,"Argument of not has type other than Bool."); return typed(e,Bool); }
    if (isvoid_class *u = dynamic_cast<isvoid_class *>(e)) { check(u->get_e1()); return typed(e,Bool); }
    if (new__class *n = dynamic_cast<new__class *>(e)) {
        if (n->get_type_name()!=SELF_TYPE && !table->has_class(n->get_type_name())) error(e,"'new' used with undefined class.");
        return typed(e,n->get_type_name());
    }
    return typed(e, Object);
}

void TypeChecker::check_feature(Feature f)
{
    if (attr_class *a = dynamic_cast<attr_class *>(f)) {
        Symbol t = check(a->get_init());
        Symbol current_name = dynamic_cast<class__class *>(current_class)->get_name();
        if (t != No_type && !table->conforms(t, a->get_type_decl(), current_name))
            error(a->get_init(), "Attribute initializer type does not conform to declared type.");
    } else if (method_class *m = dynamic_cast<method_class *>(f)) {
        objects.enter();
        Formals_class *formals = m->get_formals();
        for (int i=formals->first(); formals->more(i); i=formals->next(i)) {
            formal_class *fm=dynamic_cast<formal_class *>(formals->nth(i)); objects.add(fm->get_name(),fm->get_type_decl());
        }
        Symbol body = check(m->get_expr());
        Symbol current_name = dynamic_cast<class__class *>(current_class)->get_name();
        if (!table->conforms(body, m->get_return_type(), current_name)) error(m->get_expr(), "Inferred return type does not conform to declared return type.");
        objects.exit();
    }
}

void TypeChecker::check_program(Classes classes)
{
    for (int i=classes->first(); classes->more(i); i=classes->next(i)) {
        current_class=classes->nth(i);
        objects=ObjectEnvironment(); objects.enter(); objects.add(self,SELF_TYPE);
        install_features(current_class);
        class__class *cc=dynamic_cast<class__class *>(current_class);
        Features_class *features = cc->get_features();
        for (int j=features->first(); features->more(j); j=features->next(j)) check_feature(features->nth(j));
    }
}

/* The support tree keeps these methods virtual so later compiler phases can
   print an annotated tree.  The generated dump routines remain the canonical
   structural printer; each expression additionally prints its inferred type. */
void program_class::dump_with_types(ostream& s, int n) { dump(s, n); }
void class__class::dump_with_types(ostream& s, int n) { dump(s, n); }
void method_class::dump_with_types(ostream& s, int n) { dump(s, n); }
void attr_class::dump_with_types(ostream& s, int n) { dump(s, n); }
void formal_class::dump_with_types(ostream& s, int n) { dump(s, n); }
void branch_class::dump_with_types(ostream& s, int n) { dump(s, n); }
void assign_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void static_dispatch_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void dispatch_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void cond_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void loop_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void typcase_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void block_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void let_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void plus_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void sub_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void mul_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void divide_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void neg_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void lt_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void eq_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void leq_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void comp_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void int_const_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void bool_const_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void string_const_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void new__class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void isvoid_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void no_expr_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }
void object_class::dump_with_types(ostream& s, int n) { dump(s, n); dump_type(s, n); }



/*   This is the entry point to the semantic checker.

     Your checker should do the following two things:

     1) Check that the program is semantically correct
     2) Decorate the abstract syntax tree with type information
        by setting the `type' field in each Expression node.
        (see `tree.h')

     You are free to first do 1), make sure you catch all semantic
     errors. Part 2) can be done in a second stage, when you want
     to build mycoolc.
 */
void program_class::semant()
{
    initialize_constants();

    /* ClassTable constructor may do some semantic analysis */
    ClassTable *classtable = new ClassTable(classes);

    if (!classtable->errors()) {
        TypeChecker checker(classtable);
        checker.check_program(classes);
    }

    if (classtable->errors()) {
	cerr << "Compilation halted due to static semantic errors." << endl;
	exit(1);
    }
}


