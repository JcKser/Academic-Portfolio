(*
 *  PA1 - Interpretador de uma maquina de pilha, escrito em Cool.
 *
 *  Comandos aceitos (um por linha):
 *    int  empilha o inteiro
 *    +    empilha o simbolo '+'
 *    s    empilha o simbolo 's'
 *    e    avalia o topo da pilha
 *    d    exibe a pilha, do topo para a base, um elemento por linha
 *    x    encerra a execucao
 *
 *  Compilar:  /var/tmp/cool/bin/coolc stack.cl atoi.cl
 *  Executar:  /var/tmp/cool/bin/spim -file stack.s
 *)

(*
 *  StackCommand e a raiz da hierarquia. Ela define as operacoes genericas
 *  que todo comando armazenavel na pilha precisa saber responder; cada
 *  subclasse especializa o que for proprio dela.
 *
 *    toStr()   -> como o comando aparece no comando 'd'
 *    value()   -> valor inteiro (so faz sentido para IntCommand)
 *    eval(st)  -> o que acontece quando 'e' e emitido e este comando
 *                 esta no topo da pilha st
 *
 *  O comportamento padrao de eval e "nao fazer nada", que e exatamente o
 *  exigido quando ha um inteiro no topo da pilha.
 *)
class StackCommand {

   toStr() : String { "" };

   value() : Int { 0 };

   eval(st : Stack) : Object { self };

};

(*
 *  Um inteiro empilhado. Guarda o valor e sabe se converter de volta para
 *  string na hora de exibir, usando A2I (atoi.cl).
 *)
class IntCommand inherits StackCommand {

   val  : Int;
   conv : A2I <- new A2I;

   init(v : Int) : SELF_TYPE {
      {
         val <- v;
         self;
      }
   };

   value() : Int { val };

   toStr() : String { conv.i2a(val) };

   (* eval herdado: inteiro no topo deixa a pilha inalterada *)

};

(*
 *  O simbolo '+'. Ao ser avaliado, sai da pilha, retira os dois inteiros
 *  seguintes e devolve a soma para a pilha.
 *)
class PlusCommand inherits StackCommand {

   toStr() : String { "+" };

   eval(st : Stack) : Object {
      let simbolo  : StackCommand <- st.pop(),
          primeiro : Int <- st.pop().value(),
          segundo  : Int <- st.pop().value()
      in
         st.push((new IntCommand).init(primeiro + segundo))
   };

};

(*
 *  O simbolo 's'. Ao ser avaliado, sai da pilha e troca de lugar os dois
 *  elementos seguintes.
 *)
class SwapCommand inherits StackCommand {

   toStr() : String { "s" };

   eval(st : Stack) : Object {
      let simbolo  : StackCommand <- st.pop(),
          primeiro : StackCommand <- st.pop(),
          segundo  : StackCommand <- st.pop()
      in
         {
            st.push(primeiro);
            st.push(segundo);
         }
   };

};

(*
 *  Celula da lista encadeada que serve de suporte para a pilha.
 *  Uma celula void representa o fim da lista (pilha vazia).
 *)
class StackNode {

   cmd  : StackCommand;
   next : StackNode;

   init(c : StackCommand, n : StackNode) : SELF_TYPE {
      {
         cmd  <- c;
         next <- n;
         self;
      }
   };

   head() : StackCommand { cmd };

   tail() : StackNode { next };

};

(*
 *  A pilha propriamente dita. Herda de IO para conseguir imprimir a si
 *  mesma no comando 'd' (Cool tem heranca simples, entao passar o IO
 *  adiante seria mais trabalhoso do que herda-lo aqui).
 *)
class Stack inherits IO {

   top : StackNode;   -- void quando a pilha esta vazia

   isEmpty() : Bool { isvoid top };

   push(c : StackCommand) : Object {
      top <- (new StackNode).init(c, top)
   };

   peek() : StackCommand { top.head() };

   pop() : StackCommand {
      let c : StackCommand <- top.head() in
         {
            top <- top.tail();
            c;
         }
   };

   display() : Object {
      let cur : StackNode <- top in
         while (not (isvoid cur)) loop
            {
               out_string(cur.head().toStr());
               out_string("\n");
               cur <- cur.tail();
            }
         pool
   };

};

(*
 *  Laco principal: exibe o prompt, le um comando por linha e despacha.
 *)
class Main inherits IO {

   stack   : Stack <- new Stack;
   conv    : A2I <- new A2I;
   rodando : Bool <- true;

   main() : Object {
      while rodando loop
         {
            out_string(">");
            let entrada : String <- in_string() in
               if entrada = "x" then
                  rodando <- false
               else if entrada = "" then
                  rodando <- false          -- fim de arquivo: encerra sem travar
               else if entrada = "d" then
                  stack.display()
               else if entrada = "e" then
                  evaluate()
               else if entrada = "+" then
                  stack.push(new PlusCommand)
               else if entrada = "s" then
                  stack.push(new SwapCommand)
               else
                  stack.push((new IntCommand).init(conv.a2i(entrada)))
               fi fi fi fi fi fi;
         }
      pool
   };

   (*
    *  'e' com a pilha vazia nao faz nada; caso contrario, o proprio
    *  elemento do topo decide o que fazer (despacho dinamico).
    *)
   evaluate() : Object {
      if stack.isEmpty() then
         self
      else
         stack.peek().eval(stack)
      fi
   };

};
