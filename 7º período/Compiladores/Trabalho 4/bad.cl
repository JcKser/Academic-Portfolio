class A inherits Missing {
};

class B inherits Int {
};

class Main {
  x : Unknown <- true;
  x : Int;
  self : Int;
  f(a : Int, a : Bool) : Missing { a }; 
  f() : Int { true };
  main(x : Int) : Int {
    {
      z <- 1;
      if 1 then 2 else "s" fi;
      1 + false;
      ~true;
      not 1;
      new Unknown;
      let self : Int <- 0 in self;
      missing_method(1);
    }
  };
};
