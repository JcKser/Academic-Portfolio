class Parent {
  value : Int <- 1;
  get() : Int { value };
};

class Child inherits Parent {
  flag : Bool <- false;
  get() : Int { value + 1 };
  choose(x : Int) : Object {
    if flag then x else "ok" fi
  };
};

class Main inherits IO {
  main() : Object {
    {
      let x : Int <- 2, y : Int <- x + 3 in
        if y < 10 then out_int(y) else out_string("bad") fi;
      case new Child of
        p : Parent => p.get();
        c : Child => c.choose(1);
      esac;
      while false loop 0 pool;
      isvoid new Object;
    }
  };
};
