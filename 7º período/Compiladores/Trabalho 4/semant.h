#ifndef SEMANT_H_
#define SEMANT_H_

#include <assert.h>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
#include "cool-tree.h"
#include "stringtab.h"
#include "symtab.h"
#include "list.h"

using namespace std;

#define TRUE 1
#define FALSE 0

class ClassTable;
typedef ClassTable *ClassTableP;

struct MethodInfo {
  Symbol return_type;
  std::vector<Symbol> formal_names;
  std::vector<Symbol> formal_types;
};

struct ClassInfo {
  Class_ node;
  Symbol parent;
  std::map<Symbol, MethodInfo> methods;
  std::map<Symbol, Symbol> attributes;
};

class ClassTable {
private:
  int semant_errors;
  void install_basic_classes();
  ostream& error_stream;
  std::map<Symbol, ClassInfo> class_map;
  void add_class(Class_ c);
  void validate_inheritance();
  void validate_class_features(Class_ c);
  bool is_basic(Symbol s);
public:
  ClassTable(Classes);
  int errors() { return semant_errors; }
  ostream& semant_error();
  ostream& semant_error(Class_ c);
  ostream& semant_error(Symbol filename, tree_node *t);
  bool has_class(Symbol s);
  ClassInfo *info(Symbol s);
  Symbol parent(Symbol s);
  bool conforms(Symbol child, Symbol ancestor, Symbol current);
  Symbol lub(Symbol a, Symbol b, Symbol current);
  bool method(Symbol start, Symbol name, MethodInfo& out);
  bool attribute(Symbol start, Symbol name, Symbol& out);
  bool type_defined(Symbol s);
};

class ObjectEnvironment {
  std::vector< std::map<Symbol, Symbol> > scopes;
public:
  void enter() { scopes.push_back(std::map<Symbol, Symbol>()); }
  void exit() { if (!scopes.empty()) scopes.pop_back(); }
  void add(Symbol name, Symbol type) {
    if (scopes.empty()) enter();
    scopes.back()[name] = type;
  }
  bool lookup(Symbol name, Symbol& type) const {
    for (int i = (int)scopes.size() - 1; i >= 0; --i) {
      std::map<Symbol, Symbol>::const_iterator it = scopes[i].find(name);
      if (it != scopes[i].end()) { type = it->second; return true; }
    }
    return false;
  }
};

class TypeChecker {
  ClassTable *table;
  Class_ current_class;
  ObjectEnvironment objects;
  Symbol check(Expression e);
  void error(Expression e, const std::string& message);
  bool check_actuals(Expressions actual, const MethodInfo& method,
                    Expression where);
  void install_features(Class_ c);
  void check_feature(Feature f);
  Symbol resolve_self_type(Symbol type);
public:
  TypeChecker(ClassTable *t) : table(t), current_class(0) {}
  void check_program(Classes classes);
};

#endif
