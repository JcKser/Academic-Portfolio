import java.io.*;

class ExemploArq 
{
  public static void main(String caminho) throws Exception
  {
   
    RandomAccessFile ra = new RandomAccessFile("./matrtrícula_quicksort.txt", "rw");

    String test = ra.readLine(); 

   
    

    
    ra.close();
    RandomAccessFile ma = new RandomAccessFile("./copia.txt", "rw");
    ma.writeChars(test);
     ma.close();
  
}
}
