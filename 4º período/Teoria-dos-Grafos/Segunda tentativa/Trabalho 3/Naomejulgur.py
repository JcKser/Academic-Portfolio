import yt_dlp
import os

def baixar_audio_youtube(url_video, nome_arquivo_saida="audio_live_convertido"):
    """
    Baixa o áudio de um vídeo/live do YouTube e o converte para MP3.

    Args:
        url_video (str): A URL completa e válida do vídeo/live do YouTube.
        nome_arquivo_saida (str): O nome base do arquivo de saída (sem extensão).
    """
    # Verifica se a URL é válida
    if not url_video or not url_video.startswith("http"):
        print("Erro: A URL do vídeo é inválida ou incompleta.")
        return

    # Opções de configuração para o yt-dlp
    # 'format': 'bestaudio/best' seleciona a melhor qualidade de áudio disponível.
    # 'postprocessors': Define as ações a serem executadas após o download.
    #   'key': 'FFmpegExtractAudio' usa o FFmpeg para extrair o áudio.
    #   'preferredcodec': 'mp3' especifica que o formato de saída deve ser MP3.
    #   'preferredquality': '192' define a taxa de bits do MP3 em 192 kbps (uma boa qualidade).
    # 'outtmpl': Define o padrão do nome do arquivo de saída.
    #   os.path.join(os.getcwd(), ...) garante que o arquivo seja salvo na pasta atual.
    #   f"{nome_arquivo_saida}.%(ext)s" usa o nome base e adiciona a extensão do arquivo.
    # 'quiet', 'no_warnings', 'verbose': Controlam a quantidade de informações exibidas no terminal.
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(os.getcwd(), f"{nome_arquivo_saida}.%(ext)s"),
        'quiet': False,
        'no_warnings': False,
        'verbose': False,
    }

    print(f"Tentando baixar áudio do vídeo/live: {url_video}")
    try:
        # Cria uma instância do YoutubeDL com as opções configuradas
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Inicia o processo de download
            ydl.download([url_video])
        print(f"Áudio baixado e convertido com sucesso para {nome_arquivo_saida}.mp3")
    except yt_dlp.utils.DownloadError as e:
        # Captura erros específicos do yt-dlp, como vídeo não disponível ou live futura
        print(f"Erro ao baixar o áudio: {e}")
        if "ERROR: This live event will begin in" in str(e):
            print("Atenção: Esta é uma live futura e ainda não começou ou está offline.")
        elif "ERROR: This live event has finished" in str(e) or "This video is not available." in str(e):
            print("Atenção: A live pode ter terminado ou o vídeo não está mais disponível.")
    except Exception as e:
        # Captura outros erros inesperados
        print(f"Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    # URL do vídeo/live "20 Anos do Programa de Pós-Graduação em Informática" do ICEI PUC Minas
    url_do_video = "http://www.youtube.com/watch?v=XAOMOiiqgHQ"

    # Nome base para o arquivo de áudio de saída (ex: "ICEI_PUC_Minas_20_Anos_Pos_Graduacao.mp3")
    nome_do_arquivo = "ICEI_PUC_Minas_20_Anos_Pos_Graduacao"

    # Chama a função para baixar o áudio
    baixar_audio_youtube(url_do_video, nome_do_arquivo)
