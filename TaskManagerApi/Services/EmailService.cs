using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace TaskManagerApi.Services;

    public class EmailService 
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpServer = _config["SmtpSettings:Server"];
            var smtpPort = int.Parse(_config["SmtpSettings:Port"]);
            var senderName = _config["SmtpSettings:SenderName"];
            var senderEmail = _config["SmtpSettings:SenderEmail"];
            var username = _config["SmtpSettings:Username"];
            var password = _config["SmtpSettings:Password"];

            using (var client = new SmtpClient(smtpServer, smtpPort))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(username, password);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = false
                };

                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
            }
        }
    }
