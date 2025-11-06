import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

//-----------------------PLAYER CLASS---------------------------//
class Player {

    private int id;
    private String name;
    private int height;
    private int weight;
    private String university;
    private int birthYear;
    private String birthCity;
    private String birthState;

    public Player(String request, File table) {
        try {
            Scanner scanner = new Scanner(table);

            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                String[] elements = line.split(",", -1);

                for (int i = 0; i < elements.length; i++) {
                    if (elements[i].isEmpty()) {
                        elements[i] = "not provided";
                    }
                }

                if (request.equals(elements[0]) && elements.length == 8) {
                    setId(Integer.parseInt(elements[0]));
                    setName(elements[1]);
                    setHeight(Integer.parseInt(elements[2]));
                    setWeight(Integer.parseInt(elements[3]));
                    setUniversity(elements[4]);
                    setBirthYear(Integer.parseInt(elements[5]));
                    setBirthCity(elements[6]);
                    setBirthState(elements[7]);
                }
            }

            scanner.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            System.out.println("File not found");
        }
    }

    public Player(String playerName) {
        this.name = playerName;
        this.height = 0;
        this.birthYear = 0;
        this.birthCity = "0";
        this.birthState = "0";
        this.id = 0;
        this.weight = 0;
        this.university = "0";
    }

    public void setId(int playerId) {
        this.id = playerId;
    }

    private void setName(String playerName) {
        this.name = playerName;
    }

    public void setHeight(int playerHeight) {
        this.height = playerHeight;
    }

    public void setWeight(int playerWeight) {
        this.weight = playerWeight;
    }

    public void setUniversity(String playerUniversity) {
        this.university = playerUniversity;
    }

    public void setBirthYear(int playerBirthYear) {
        this.birthYear = playerBirthYear;
    }

    public void setBirthCity(String playerBirthCity) {
        this.birthCity = playerBirthCity;
    }

    public void setBirthState(String playerBirthState) {
        this.birthState = playerBirthState;
    }

    public int getId() {
        return this.id;
    }

    public int getHeight() {
        return this.height;
    }

    public String getName() {
        return this.name;
    }

    public int getWeight() {
        return this.weight;
    }

    public String getUniversity() {
        return this.university;
    }

    public int getBirthYear() {
        return this.birthYear;
    }

    public String getBirthCity() {
        return this.birthCity;
    }

    public String getBirthState() {
        return this.birthState;
    }

    public String playerInfo() {
        return (
                " ## " +
                        getName() +
                        " ## " +
                        getHeight() +
                        " ## " +
                        getWeight() +
                        " ## " +
                        getBirthYear() +
                        " ## " +
                        getUniversity() +
                        " ## " +
                        getBirthCity() +
                        " ## " +
                        getBirthState() +
                        " ##");
    }
}

// -----------------------NODE CLASS---------------------------//
class Node {
    Player element;
    Node left, right;

    public Node(Player element) {
        this(element, null, null);
    }

    public Node(Player element, Node left, Node right) {
        this.element = element;
        this.left = left;
        this.right = right;
    }
}

// -----------------------BINARY TREE CLASS---------------------------//
class BinaryTree {

    Node root;

    public BinaryTree() {
        root = null;
    }

    public Player getMaximum() {
        Player tmp = null;

        if (root != null) {
            Node i;
            for (i = root; i.right != null; i = i.right)
                ;
            tmp = i.element;
        }

        return tmp;
    }

    public Player getMinimum() {
        Player tmp = null;

        if (root != null) {
            Node i;
            for (i = root; i.left != null; i = i.left)
                ;
            tmp = i.element;
        }

        return tmp;
    }

    public int getHeight() {
        return getHeight(root, 0);
    }

    public int getHeight(Node i, int height) {
        if (i == null) {
            height--;
        } else {
            int leftHeight = getHeight(i.left, height + 1);
            int rightHeight = getHeight(i.right, height + 1);
            height = (leftHeight > rightHeight) ? leftHeight : rightHeight;
        }
        return height;
    }

    public void insert(Player player) throws Exception {
        root = insert(player, root);
    }

    private Node insert(Player player, Node i) throws Exception {
        if (i == null) {
            i = new Node(player);
        } else if (player.getName().compareTo(i.element.getName()) < 0) {
            i.left = insert(player, i.left);
        } else if (player.getName().compareTo(i.element.getName()) > 0) {
            i.right = insert(player, i.right);
        } else {
            throw new Exception("Error inserting");
        }
        return i;
    }

    public void remove(Player player) throws Exception {
        root = remove(player, root);
    }

    private Node remove(Player player, Node i) throws Exception {
        if (i == null) {
            throw new Exception("Error removing");
        } else if (player.getName().compareTo(i.element.getName()) < 0) {
            i.left = remove(player, i.left);
        } else if (player.getName().compareTo(i.element.getName()) > 0) {
            i.right = remove(player, i.right);
        } else if (i.left == null) {
            i = i.right;
        } else if (i.right == null) {
            i = i.left;
        } else {
            i.left = findMaxLeft(i, i.left);
        }
        return i;
    }

    private Node findMaxLeft(Node i, Node j) {
        if (j.right == null) {
            i.element = j.element;
            j = j.left;
        } else {
            j.right = findMaxLeft(i, j.right);
        }
        return j;
    }

    public void search(Player player) {
        System.out.print(" root");
        if (search(player, root)) {
            System.out.println(" YES");
        } else {
            System.out.println(" NO");
        }
    }

    private boolean search(Player player, Node i) {
        boolean result = false;

        if (i == null) {
            result = false;
        } else if (player.getName().compareTo(i.element.getName()) == 0) {
            result = true;
        } else if (player.getName().compareTo(i.element.getName()) < 0) {
            System.out.print(" left");
            result = search(player, i.left);
        } else {
            System.out.print(" right");
            result = search(player, i.right);
        }

        return result;
    }

    public void display() {
        display(root);
    }

    private void display(Node i) {
        if (i != null) {
            System.out.println(i.element.getName());
            display(i.left);
            display(i.right);
        }
    }
}

// -------------------Main---------------------------//
public class BinarySearchTree {
    public static void main(String[] args) throws Exception {

        Scanner scanner = new Scanner(System.in);
        File table = new File("/tmp/players.csv");
        BinaryTree tree = new BinaryTree();

        String request = scanner.nextLine();
        while (!request.equalsIgnoreCase("END")) {
            Player player = new Player(request, table);
            tree.insert(player);
            request = scanner.nextLine();
        }

        request = scanner.nextLine();
        while (!request.equalsIgnoreCase("END")) {
            Player player = new Player(request);
            System.out.print(player.getName());
            tree.search(player);
            request = scanner.nextLine();
        }
        scanner.close();
    }
}
